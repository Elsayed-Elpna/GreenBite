import api from "@/api/axios"

/* 
Put only order endpoints there:
	•	createOrder(payload) → POST /community/market/orders
	•	getBuyerOrders(params) → GET /community/market/orders/buyer
	•	getSellerOrders(params) → GET /community/market/orders/seller
	•	getOrderDetails(orderId) → GET /community/market/orders/{order_id}
	•	acceptOrder(orderId) → PATCH /community/market/orders/{order_id}/accept
	•	updateOrderStatus(orderId, status) → PATCH /community/market/orders/{order_id}/status

This keeps your src/api/marketplacelisting.js from becoming a monster file.
*/

/**
 * Create order
 * POST /community/market/orders
 */
export async function createOrder(payload){
    const res = await api.post("/api/community/market/orders/", payload);
    return res.data;
}

/**
 * Buyer orders
 * GET /community/market/orders/buyer?status=&page=&page_size=
 */

export async function getBuyerOrders({status, page = 1, pageSize = 10 } = {}){ //destructuring in defaults
    const res = await api.get("/api/community/market/orders/buyer/", {
        params: {
            status: status || undefined, //supports filtering by order status
            page,
            page_size: pageSize,
        },
    });
    return res.data;
}

export async function getSellerOrders({status, page = 1, pageSize = 10 } = {}){ //destructuring in defaults
    const res = await api.get("/api/community/market/orders/seller/", {
        params: {
            status: status || undefined, //supports filtering by order status
            page,
            page_size: pageSize,
        },
    });
    return res.data;
}

/**
 * Order details
 * GET /community/market/orders/{order_id}
 */
export async function getOrderDetails(orderId){
    const res = await api.get(`/api/community/market/orders/${orderId}/`);
    return res.data;
}

/**
 * Seller accepts order
 * PATCH /community/market/orders/{order_id}/accept
 */
export async function acceptOrder(orderId){
    const res = await api.patch(`/api/community/market/orders/${orderId}/accept/`);
    return res.data;
}
/**
 * Update order status
 * PATCH /community/market/orders/{order_id}/status
 * body: { status: "DELIVERED" | "CANCELLED" }
 */
export async function updateOrderStatus({orderId, status}){
    const res = await api.patch(`/api/community/market/orders/${orderId}/status/`,{
        status,
    });
    return res.data;
}