import { NextResponse } from "next/server";
import { RefundStatus, ReturnEventType, ReturnStatus } from "@prisma/client";
import { getAdminUser } from "@/lib/auth/getAdminUser";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({success:false,message:"Unauthorized."},{status:401});
  const body=await request.json().catch(()=>null) as {returnId?:unknown}|null;
  if(!body||typeof body.returnId!=="string") return NextResponse.json({success:false,message:"Return ID is required."},{status:400});

  const refund=await prisma.refund.findUnique({where:{returnRequestId:body.returnId},include:{returnRequest:{include:{user:{select:{id:true}},order:{include:{payments:{orderBy:{createdAt:"desc"},take:1}}}}}}});
  if(!refund) return NextResponse.json({success:false,message:"Refund record not found."},{status:404});
  if(refund.method!=="STRIPE") return NextResponse.json({success:false,message:"This refund must be processed through its original payment method."},{status:409});
  if(refund.status===RefundStatus.SUCCEEDED) return NextResponse.json({success:true,message:"Refund is already confirmed.",data:refund});
  const payment=refund.returnRequest.order.payments[0];
  if(!payment?.paymentIntentId||payment.method!=="STRIPE") return NextResponse.json({success:false,message:"Original Stripe payment reference is missing."},{status:409});
  if(refund.currency!=="USD") return NextResponse.json({success:false,message:"Stripe refund currency does not match the supported USD settlement."},{status:409});

  const claimed=await prisma.refund.updateMany({where:{id:refund.id,status:{in:[RefundStatus.PENDING,RefundStatus.FAILED,RefundStatus.PROCESSING]}},data:{status:RefundStatus.PROCESSING,failureReason:null}});
  if(claimed.count!==1) {
    const latest=await prisma.refund.findUnique({where:{id:refund.id}});
    return NextResponse.json({success:true,message:"Refund is already being processed or completed.",data:latest});
  }

  try {
    // Recover a previously accepted refund before attempting another create. This
    // also protects retries after Stripe's idempotency-key retention period.
    const existingRefunds = await stripe.refunds.list({ payment_intent: payment.paymentIntentId, limit: 100 });
    const existingRefund = existingRefunds.data.find(item => item.metadata?.refundId === refund.id);
    const providerRefund = existingRefund ?? await stripe.refunds.create({
      payment_intent:payment.paymentIntentId,
      amount:Math.round(Number(refund.amount)*100),
      reason:"requested_by_customer",
      metadata:{returnId:refund.returnRequestId,refundId:refund.id,returnCode:refund.returnRequest.returnCode},
    },{idempotencyKey:refund.idempotencyKey});
    const status=providerRefund.status==="succeeded"?RefundStatus.SUCCEEDED:providerRefund.status==="failed"||providerRefund.status==="canceled"?RefundStatus.FAILED:RefundStatus.PROCESSING;
    const updated=await prisma.$transaction(async tx=>{
      const changed=await tx.refund.updateMany({where:{id:refund.id,status:RefundStatus.PROCESSING},data:{providerRefundId:providerRefund.id,status,processedAt:status===RefundStatus.SUCCEEDED?new Date():null,failureReason:providerRefund.failure_reason||null,processedById:admin.id}});
      if(changed.count===1){
        await tx.returnRequest.updateMany({where:{id:refund.returnRequestId,status:ReturnStatus.REFUND_PROCESSING},data:{status:status===RefundStatus.SUCCEEDED?ReturnStatus.REFUNDED:ReturnStatus.REFUND_PROCESSING,closedAt:status===RefundStatus.SUCCEEDED?new Date():null}});
        await tx.returnEvent.create({data:{returnRequestId:refund.returnRequestId,actorId:admin.id,type:status===RefundStatus.SUCCEEDED?ReturnEventType.REFUND_SUCCEEDED:status===RefundStatus.FAILED?ReturnEventType.REFUND_FAILED:ReturnEventType.REFUND_INITIATED,title:status===RefundStatus.SUCCEEDED?"Stripe refund confirmed":status===RefundStatus.FAILED?"Stripe refund failed":"Stripe refund processing",description:`Stripe refund ${providerRefund.id} status: ${providerRefund.status}.`}});
        if (status === RefundStatus.SUCCEEDED || status === RefundStatus.FAILED) {
          await tx.notification.create({
            data: {
              userId: refund.returnRequest.user.id,
              type: "RETURN_UPDATE",
              title: status === RefundStatus.SUCCEEDED ? "Refund completed" : "Refund needs attention",
              message: status === RefundStatus.SUCCEEDED
                ? `Your refund for return ${refund.returnRequest.returnCode} has been confirmed.`
                : `Your refund for return ${refund.returnRequest.returnCode} could not be completed. Our team will review it.`,
              href: "/account/returns",
              metadata: { returnId: refund.returnRequestId, returnCode: refund.returnRequest.returnCode, stripeRefundId: providerRefund.id },
            },
          });
        }
      }
      return tx.refund.findUniqueOrThrow({where:{id:refund.id}});
    });
    return NextResponse.json({success:true,data:updated,message:status===RefundStatus.SUCCEEDED?"Stripe refund completed.": "Stripe accepted the refund request; final status will be confirmed by Stripe."});
  } catch(error) {
    // A timeout may occur after Stripe accepted the request. Keep PROCESSING and
    // retry with the exact same Stripe idempotency key; never create a second refund.
    console.error("[admin:returns:stripe-refund]",error);
    return NextResponse.json({success:false,message:"Stripe refund outcome is not yet confirmed. Keep this refund in processing and retry safely; do not create a manual duplicate."},{status:502});
  }
}
