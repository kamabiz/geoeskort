import { CommunityMessageEditor } from '@/components/admin/CommunityMessageEditor';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function EditCommunityMessagePage({ params }: Props) {
  await requireAuth();
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      sender: { select: { username: true } },
      recipient: { select: { username: true } },
    },
  });
  if (!message) notFound();

  return (
    <AdminShell
      minimal
      backHref="/admin/community/?tab=messages"
      backLabel="← Community audit"
    >
      <main className="admin-main admin-main--wide">
        <CommunityMessageEditor
          message={{
            id: message.id,
            body: message.body,
            roomId: message.roomId,
            senderLabel: message.sender.username,
            recipientLabel: message.recipient?.username ?? null,
            createdAt: message.createdAt.toISOString(),
          }}
        />
      </main>
    </AdminShell>
  );
}
