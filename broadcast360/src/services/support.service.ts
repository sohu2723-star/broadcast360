import {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  getNewContactMessageCount,
  getSupportConversations,
  getSupportConversationById,
  createSupportConversation,
  createSupportMessage,
  closeSupportConversation,
  reopenSupportConversation,
  getUnreadPremiumChatCount,
  markUserMessagesAsRead,
} from "@/repositories/support.repository";
import { getPendingReactivationRequestCount as countPendingReactivationRequests } from "@/services/reactivation.service";

// Helper to sanitize pagination parameters safely against NaN
function sanitizePagination(page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.min(50, Math.floor(limit))
      : 10;

  return { page: safePage, limit: safeLimit };
}

// =====================================================
// CONTACT
// =====================================================

export async function submitContactMessage(data: {
  userId?: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return createContactMessage({
    ...data,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim(),
  });
}

export async function fetchContactMessages(
  page: number,
  limit: number,
  status?: "NEW" | "READ" | "RESOLVED"
) {
  const { page: validatedPage, limit: validatedLimit } = sanitizePagination(
    page,
    limit
  );

  const { data, total } = await getContactMessages({
    page: validatedPage,
    limit: validatedLimit,
    status,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages: Math.ceil(total / validatedLimit),
    },
  };
}

export async function fetchContactMessageById(id: number) {
  return getContactMessageById(id);
}

export async function changeContactMessageStatus(
  id: number,
  status: "NEW" | "READ" | "RESOLVED"
) {
  return updateContactMessageStatus(id, status);
}

export async function getContactNotificationCount() {
  return getNewContactMessageCount();
}

// =====================================================
// PREMIUM CHAT
// =====================================================

export async function fetchSupportConversations(page: number, limit: number) {
  const { page: validatedPage, limit: validatedLimit } = sanitizePagination(
    page,
    limit
  );

  const { data, total } = await getSupportConversations({
    page: validatedPage,
    limit: validatedLimit,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages: Math.ceil(total / validatedLimit),
    },
  };
}

export async function fetchSupportConversation(id: number) {
  return getSupportConversationById(id);
}

export async function openSupportConversation(userId: number) {
  return createSupportConversation(userId);
}

export async function sendSupportMessage(data: {
  conversationId: number;
  senderId: number;
  senderRole: "USER" | "ADMIN";
  message: string;
}) {
  return createSupportMessage({
    ...data,
    message: data.message.trim(),
  });
}

export async function closeSupportChat(id: number) {
  return closeSupportConversation(id);
}

export async function reopenSupportChat(id: number) {
  return reopenSupportConversation(id);
}

export async function getPremiumChatNotificationCount() {
  return getUnreadPremiumChatCount();
}

export async function markPremiumChatAsRead(conversationId: number) {
  return markUserMessagesAsRead(conversationId);
}

export async function getReactivationNotificationCount() {
  return countPendingReactivationRequests();
}
