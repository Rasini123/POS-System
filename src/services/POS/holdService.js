import axios from "axios";
import { API_URL } from "../../config";

// =============================================
// HOLD DETAILS API SERVICE
// Connects to /HoldDetails/* endpoints
// =============================================

export const holdService = {

  // ─── Helpers ────────────────────────────────────────
  _getUserId: () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.UserId || user?.userId || user?.LogId || "1";
    } catch { return "1"; }
  },

  _generateSessionId: () => {
    return `SESS_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  },

  // ─── 1. ADD HOLD ITEM (POST) ───────────────────────
  // Adds one item to a hold session
  addHoldItem: async ({ sessionId, productId, qty, unitPrice }) => {
    try {
      const userId = holdService._getUserId();
      const response = await axios.post(`${API_URL}/HoldDetails/AddHoldItem`, null, {
        params: {
          SessionId: String(sessionId),
          UserId: String(userId),
          ProductId: String(productId),
          Qty: String(qty),
          UnitPrice: String(unitPrice),
          CreatedBy: String(userId)
        }
      });
      return response.data;
    } catch (error) {
      console.error("holdService.addHoldItem failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 2. UPDATE HOLD ITEM (POST) ────────────────────
  // Updates quantity/price of an existing hold item
  updateHoldItem: async ({ holdId, qty, unitPrice }) => {
    try {
      const userId = holdService._getUserId();
      const response = await axios.post(`${API_URL}/HoldDetails/UpdateHoldItem`, null, {
        params: {
          HoldId: String(holdId),
          Qty: String(qty),
          UnitPrice: String(unitPrice),
          UpdatedBy: String(userId)
        }
      });
      return response.data;
    } catch (error) {
      console.error("holdService.updateHoldItem failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 3. SOFT DELETE HOLD ITEM (POST) ───────────────
  // Marks a hold item as deleted (soft delete)
  softDeleteHoldItem: async (holdId) => {
    try {
      const userId = holdService._getUserId();
      const response = await axios.post(`${API_URL}/HoldDetails/SoftDeleteHoldItem`, null, {
        params: {
          HoldId: String(holdId),
          UpdatedBy: String(userId)
        }
      });
      return response.data;
    } catch (error) {
      console.error("holdService.softDeleteHoldItem failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 4. RELEASE HOLD (POST) ────────────────────────
  // Releases all hold items for a session (marks them as released)
  releaseHold: async (sessionId) => {
    try {
      const userId = holdService._getUserId();
      const response = await axios.post(`${API_URL}/HoldDetails/ReleaseHold`, null, {
        params: {
          SessionId: String(sessionId),
          UpdatedBy: String(userId)
        }
      });
      return response.data;
    } catch (error) {
      console.error("holdService.releaseHold failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 5. GET ALL ACTIVE HOLDS (GET) ─────────────────
  // Retrieves all active hold items across all sessions
  getAllActiveHolds: async () => {
    try {
      const response = await axios.get(`${API_URL}/HoldDetails/GetAllActiveHolds`);
      return response.data?.ResultSet || response.data || [];
    } catch (error) {
      console.error("holdService.getAllActiveHolds failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 6. GET HOLD BY ID (GET) ───────────────────────
  // Retrieves a single hold item by its HoldId
  getHoldById: async (holdId) => {
    try {
      const response = await axios.get(`${API_URL}/HoldDetails/GetHoldById`, {
        params: { HoldId: String(holdId) }
      });
      const result = response.data?.ResultSet || response.data;
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error("holdService.getHoldById failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── 7. GET HOLDS BY SESSION ID (GET) ──────────────
  // Retrieves all hold items belonging to a specific session
  getHoldsBySessionId: async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/HoldDetails/GetHoldsBySessionId`, {
        params: { SessionId: String(sessionId) }
      });
      return response.data?.ResultSet || response.data || [];
    } catch (error) {
      console.error("holdService.getHoldsBySessionId failed:", error);
      throw error.response?.data || error;
    }
  },

  // ─── COMPOSITE: Hold entire cart ───────────────────
  // Convenience method: sends all cart items to hold in one session
  holdCartItems: async (items, sessionId) => {
    const sid = sessionId || holdService._generateSessionId();
    const results = [];

    for (const item of items) {
      try {
        const res = await holdService.addHoldItem({
          sessionId: sid,
          productId: item.productId || item.id,
          qty: item.quantity || 1,
          unitPrice: item.discountedPrice || item.price || 0
        });
        results.push({ success: true, item, response: res });
      } catch (err) {
        results.push({ success: false, item, error: err });
      }
    }

    return { sessionId: sid, results };
  },

  // ─── COMPOSITE: Resume held session ────────────────
  // Fetches all items for a session and returns them in a cart-ready format
  resumeHeldSession: async (sessionId) => {
    const holds = await holdService.getHoldsBySessionId(sessionId);
    const items = (Array.isArray(holds) ? holds : []).map(h => ({
      holdId: h.HoldId || h.holdId,
      productId: h.ProductId || h.productId,
      quantity: Number(h.Qty || h.qty || 1),
      unitPrice: Number(h.UnitPrice || h.unitPrice || 0),
      sessionId: h.SessionId || h.sessionId
    }));
    return { sessionId, items };
  }
};
