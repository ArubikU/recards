import { deleteRoom, updateRoomCount } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const AuthObject = await auth();
    const { userId } = AuthObject;
    const para = await params
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = para.id;

    try{
    await deleteRoom(roomId);
    await updateRoomCount(AuthObject);
    } catch (error) {
        console.log('Error deleting room:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ message: `Room ${roomId} deleted.` }, { status: 200 });
}