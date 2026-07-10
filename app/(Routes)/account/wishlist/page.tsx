import { WishlistCards } from '@/app/(Routes)/account/wishlist/WishlistCards';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

const page = async () => {
    return (
        <WishlistCards />
    );
};

export default page;