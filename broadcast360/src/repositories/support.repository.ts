
import { prisma } from "@/lib/prisma";

// =====================================================
// CONTACT MESSAGES
// =====================================================

export async function createContactMessage(data: {
  userId?: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return prisma.contactMessage.create({
    data,
  });
}

export async function getContactMessages({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: "NEW" | "READ" | "RESOLVED";
}) {
  const skip = (page - 1) * limit;

  const where = status
    ? {
        status,
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.contactMessage.count({
      where,
    }),
  ]);

  return {
    data,
    total,
  };
}

export async function getContactMessageById(id: number) {
  return prisma.contactMessage.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateContactMessageStatus(
  id: number,
  status: "NEW" | "READ" | "RESOLVED",
) {
  return prisma.contactMessage.update({
    where: {
      id,
    },

    data: {
      status,
    },
  });
}

export async function getNewContactMessageCount() {
  return prisma.contactMessage.count({
    where: {
      status: "NEW",
    },
  });
}

// =====================================================
// PREMIUM CHAT
// =====================================================

export async function getSupportConversations({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.supportConversation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        messages: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.supportConversation.count(),
  ]);

  return {
    data,
    total,
  };
}

export async function getSupportConversationById(
  id: number,
) {
  return prisma.supportConversation.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function createSupportConversation(
  userId: number,
) {
  return prisma.supportConversation.create({
    data: {
      userId,
    },
  });
}

export async function createSupportMessage(data: {
  conversationId: number;
  senderId: number;
  senderRole: "USER" | "ADMIN";
  message: string;
}) {
  return prisma.supportMessage.create({
    data,
  });
}

export async function closeSupportConversation(
  id: number,
) {
  return prisma.supportConversation.update({
    where: {
      id,
    },

    data: {
      status: "CLOSED",
    },
  });
}

export async function reopenSupportConversation(
  id: number,
) {
  return prisma.supportConversation.update({
    where: {
      id,
    },

    data: {
      status: "OPEN",
    },
  });
}

export async function getUnreadPremiumChatCount() {
  return prisma.supportMessage.count({
    where: {
      senderRole: "USER",
      isRead: false,
    },
  });
}

export async function markUserMessagesAsRead(
  conversationId: number,
) {
  return prisma.supportMessage.updateMany({
    where: {
      conversationId,
      senderRole: "USER",
      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
}
