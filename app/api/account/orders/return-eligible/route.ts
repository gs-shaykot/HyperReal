import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const activeStatuses = ["REQUESTED","APPROVED","IN_TRANSIT","RECEIVED","INSPECTING","REFUND_APPROVED","REFUND_PROCESSING","REFUNDED"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.sessionRevoked) return NextResponse.json({success:false,message:"Unauthorized."},{status:401});
  const user = await prisma.user.findUnique({where:{id:session.user.id},select:{id:true,isBlocked:true}});
  if (!user || user.isBlocked) return NextResponse.json({success:false,message:"Unauthorized."},{status:401});
  const orders = await prisma.order.findMany({
    where:{userId:user.id,status:"DELIVERED",shipment:{is:{status:"DELIVERED",deliveredAt:{gte:new Date(Date.now()-7*24*60*60*1000)}}},payments:{some:{status:"SUCCESS"}}},
    orderBy:{createdAt:"desc"},
    select:{id:true,orderCode:true,status:true,shipment:{select:{status:true,deliveredAt:true}},orderItems:{select:{id:true,quantity:true,priceAtPurchase:true,variant:{select:{size:true,color:true,product:{select:{name:true}}}}}}},
  });
  const itemIds=orders.flatMap(o=>o.orderItems.map(i=>i.id));
  const used=itemIds.length?await prisma.returnItem.findMany({where:{orderItemId:{in:itemIds},returnRequest:{status:{in:[...activeStatuses]}}},select:{orderItemId:true,requestedQuantity:true}}):[];
  const totals=new Map<string,number>();
  for(const row of used) totals.set(row.orderItemId,(totals.get(row.orderItemId)||0)+row.requestedQuantity);
  const data=orders.map(o=>({...o,orderItems:o.orderItems.map(i=>({...i,quantity:Math.max(0,i.quantity-(totals.get(i.id)||0))})).filter(i=>i.quantity>0)})).filter(o=>o.orderItems.length>0);
  return NextResponse.json({success:true,data});
}
