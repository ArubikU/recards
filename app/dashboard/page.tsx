
import ErrorMessage from "@/components/error-message";
import { createUser, getLeftRoomsCount, getRoomsByUserId, getUserByClerkId } from "@/lib/db";
import { getTierObject } from "@/lib/getLimits";
import { Room } from "@/lib/types";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Book, ClipboardList, Layers } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreateRoom from "../rooms/create-room";
import RoomCard from "../rooms/room-card";

export default async function Dashboard() {
  const authObj = await auth();
  const { userId: clerkId } = authObj;

  if (!clerkId) redirect("/login");

  const user = await getUserByClerkId(clerkId);
  const duser = await currentUser();

  if (!user) {
    await createUser(clerkId, duser!.emailAddresses[0].emailAddress);
    return (
      <ErrorMessage title="Error de cuenta" message="No se pudo encontrar tu cuenta en nuestra base de datos. Por favor, contacta a soporte." />
    );
  }

  const client = await clerkClient();
  const userData = await client.users.getUser(clerkId);
  const currentPlan = getTierObject(userData?.publicMetadata?.plan as string | undefined || "free");
  const limits = currentPlan.limits;
  const leftRoomsCount = await getLeftRoomsCount(authObj);
  const rooms: Room[] = await getRoomsByUserId(user.id);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-ink">Bienvenido de vuelta</h1>
          {!currentPlan.isUltimate && (
            <p className="text-sm text-ink mt-2">
              Rooms restantes: <span className="font-medium text-iris">{leftRoomsCount}</span> / {limits.rooms}
            </p>
          )}
        </div>
        <CreateRoom leftRoomsCount={leftRoomsCount} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms Recientes */}
        <div className="lg:col-span-2 bg-ivory shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-iris">Rooms Recientes</h2>
          {rooms.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.slice(0, 4).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/rooms" className="text-iris hover:underline">
                Ver todas las Rooms
              </Link>
            </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-ink mb-4">Aún no has creado ningún room.</p>
              <Link href="/rooms/new" className="btn-primary">
                Crear tu primer Room
              </Link>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="bg-ivory shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-iris">Estadísticas</h2>
          <div className="space-y-6">
            <StatBox icon={<Layers className="text-iris" />} label="Total de Rooms" value={rooms.length} />
            <StatBox icon={<Book className="text-iris" />} label="Flashcards Creadas" value="-" />
            <StatBox icon={<ClipboardList className="text-iris" />} label="Quizzes Completados" value="-" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-iris/10 flex items-center justify-center rounded-full">
        {icon}
      </div>
      <div>
        <p className=" text-sm">{label}</p>
        <p className="text-xl font-bold text-gray-ink">{value}</p>
      </div>
    </div>
  );
}
