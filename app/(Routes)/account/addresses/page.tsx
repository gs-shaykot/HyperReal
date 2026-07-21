import { Address } from "@/app/(Routes)/account/addresses/Address";

const page = async () => { 
    return (
        <section className='space-y-4 text-zinc-100'>
            <Address />
        </section>
    );
};

export default page;