import api from "./api";

const chatService = {
  /**
   * Get all active conversations for the current user
   * @returns {Promise<Object>} Responds with conversation data
   */
  getConversations: () => {
    return api.get("/chat/conversations");
  },

  /**
   * Get or create a conversation with a specific participant
   * @param {string} participantId - ID of the other user
   * @param {string} barterId - Optional barter ID to link
   * @returns {Promise<Object>} Responds with the conversation object
   */
  createConversation: (participantId, barterId) => {
    return api.post("/chat/conversations", { participantId, barterId });
  },

  /**
   * Get all messages for a specific conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Responds with messages array
   */
  getMessages: (conversationId) => {
    return api.get(`/chat/conversations/${conversationId}`);
  },

  /**
   * Send a new message inside a conversation
   * @param {string} conversationId - The conversation ID
   * @param {string} content - Text content of message
   * @param {string} type - 'text' or 'file'
   * @returns {Promise<Object>} Result message and newly created msg object
   */
  sendMessage: (conversationId, content, type = "text") => {
    return api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      type,
    });
  },
};

export default chatService;
