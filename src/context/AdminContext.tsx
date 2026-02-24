"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Product, products as defaultProducts } from "@/data/products";
import { supabase } from "@/lib/supabase";

// ============ TYPES ============

export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    category: string;
    date: string;
    createdAt: string;
}

export interface Order {
    id: string;
    items: {
        productId: string;
        name: string;
        image: string;
        price: number;
        size: string;
        quantity: number;
    }[];
    totalPrice: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    paymentMethod?: "cod" | "bank";
    userId?: string;
    status: "new" | "pending_payment" | "processing" | "paid" | "delivering" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
}

interface AdminContextType {
    // Products
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (id: string, product: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    getProduct: (id: string) => Product | undefined;

    // Transactions
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
    updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => void;
    deleteTransaction: (id: string) => void;
    totalIncome: number;
    totalExpense: number;
    profit: number;

    // Orders
    orders: Order[];
    addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "status">) => void;
    updateOrderStatus: (id: string, status: Order["status"]) => void;
    deleteOrder: (id: string) => void;
    getOrdersByUserId: (userId: string) => Order[];

    // Loading & Reload
    isLoading: boolean;
    reloadData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

// ============ DB HELPERS ============

// Convert DB row (snake_case) → Product (camelCase)
function dbToProduct(row: Record<string, unknown>): Product {
    return {
        id: row.id as string,
        name: row.name as string,
        price: row.price as number,
        originalPrice: (row.original_price as number) || undefined,
        description: (row.description as string) || "",
        shortDescription: (row.short_description as string) || "",
        images: (row.images as string[]) || [],
        category: row.category as string,
        occasion: (row.occasion as string[]) || [],
        flowerTypes: (row.flower_types as string[]) || [],
        colors: (row.colors as string[]) || [],
        badge: (row.badge as Product["badge"]) || undefined,
        rating: Number(row.rating) || 5.0,
        reviewCount: (row.review_count as number) || 0,
        sizes: (row.sizes as { name: string; price: number }[]) || [],
        inStock: row.in_stock !== false,
    };
}

// Convert Product (camelCase) → DB row (snake_case)
function productToDb(p: Partial<Product>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (p.id !== undefined) row.id = p.id;
    if (p.name !== undefined) row.name = p.name;
    if (p.price !== undefined) row.price = p.price;
    if (p.originalPrice !== undefined) row.original_price = p.originalPrice;
    if (p.description !== undefined) row.description = p.description;
    if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
    if (p.images !== undefined) row.images = p.images;
    if (p.category !== undefined) row.category = p.category;
    if (p.occasion !== undefined) row.occasion = p.occasion;
    if (p.flowerTypes !== undefined) row.flower_types = p.flowerTypes;
    if (p.colors !== undefined) row.colors = p.colors;
    if (p.badge !== undefined) row.badge = p.badge || null;
    if (p.rating !== undefined) row.rating = p.rating;
    if (p.reviewCount !== undefined) row.review_count = p.reviewCount;
    if (p.sizes !== undefined) row.sizes = p.sizes;
    if (p.inStock !== undefined) row.in_stock = p.inStock;
    return row;
}

function dbToTransaction(row: Record<string, unknown>): Transaction {
    return {
        id: row.id as string,
        type: row.type as "income" | "expense",
        amount: row.amount as number,
        description: row.description as string,
        category: (row.category as string) || "",
        date: row.date as string,
        createdAt: row.created_at as string,
    };
}

function dbToOrder(row: Record<string, unknown>): Order {
    return {
        id: row.id as string,
        items: (row.items as Order["items"]) || [],
        totalPrice: row.total_price as number,
        customerName: row.customer_name as string,
        customerPhone: (row.customer_phone as string) || "",
        customerAddress: (row.customer_address as string) || "",
        customerNote: (row.customer_note as string) || undefined,
        paymentMethod: (row.payment_method as "cod" | "bank") || undefined,
        userId: (row.user_id as string) || undefined,
        status: row.status as Order["status"],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

// ============ PROVIDER ============

export function AdminProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>(defaultProducts);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dbReady, setDbReady] = useState(false);

    // Shared load function — used on mount and for manual reload
    const loadData = useCallback(async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // Try loading products from DB
            const { data: dbProducts, error: prodErr } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (!prodErr && dbProducts && dbProducts.length > 0) {
                setProducts(dbProducts.map(dbToProduct));
            } else if (!prodErr && dbProducts && dbProducts.length === 0) {
                const rows = defaultProducts.map((p) => productToDb(p));
                await supabase.from("products").insert(rows);
                setProducts(defaultProducts);
            }

            // Load transactions
            const { data: dbTransactions } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false });
            if (dbTransactions) setTransactions(dbTransactions.map(dbToTransaction));

            // Load orders
            const { data: dbOrders } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });
            if (dbOrders) setOrders(dbOrders.map(dbToOrder));

            setDbReady(true);
        } catch (err) {
            console.error("Supabase load error, falling back to defaults:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load data from Supabase on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Realtime subscription for orders
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel("orders-realtime")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "orders" },
                (payload) => {
                    const updated = dbToOrder(payload.new as Record<string, unknown>);
                    setOrders((prev) =>
                        prev.map((o) => (o.id === updated.id ? updated : o))
                    );
                }
            )
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "orders" },
                (payload) => {
                    const newOrder = dbToOrder(payload.new as Record<string, unknown>);
                    setOrders((prev) => {
                        if (prev.some((o) => o.id === newOrder.id)) return prev;
                        return [newOrder, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "orders" },
                (payload) => {
                    const deletedId = (payload.old as Record<string, unknown>).id as string;
                    setOrders((prev) => prev.filter((o) => o.id !== deletedId));
                }
            )
            .subscribe();

        return () => {
            if (supabase) supabase.removeChannel(channel);
        };
    }, []);

    // ---- Products ----
    const addProduct = useCallback(
        async (product: Product) => {
            setProducts((prev) => [product, ...prev]);
            if (dbReady && supabase) {
                await supabase.from("products").insert(productToDb(product));
            }
        },
        [dbReady]
    );

    const updateProduct = useCallback(
        async (id: string, updates: Partial<Product>) => {
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
            );
            if (dbReady && supabase) {
                await supabase.from("products").update(productToDb(updates)).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteProduct = useCallback(
        async (id: string) => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            if (dbReady && supabase) {
                await supabase.from("products").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const getProduct = useCallback(
        (id: string) => products.find((p) => p.id === id),
        [products]
    );

    // ---- Transactions ----
    const addTransaction = useCallback(
        async (tx: Omit<Transaction, "id" | "createdAt">) => {
            const newTx: Transaction = {
                ...tx,
                id: generateId(),
                createdAt: new Date().toISOString(),
            };
            setTransactions((prev) => [newTx, ...prev]);
            if (dbReady && supabase) {
                await supabase.from("transactions").insert({
                    id: newTx.id,
                    type: newTx.type,
                    amount: newTx.amount,
                    description: newTx.description,
                    category: newTx.category,
                    date: newTx.date,
                });
            }
        },
        [dbReady]
    );

    const updateTransaction = useCallback(
        async (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => {
            setTransactions((prev) =>
                prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
            );
            if (dbReady && supabase) {
                const dbUpdates: Record<string, unknown> = {};
                if (updates.type !== undefined) dbUpdates.type = updates.type;
                if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.category !== undefined) dbUpdates.category = updates.category;
                if (updates.date !== undefined) dbUpdates.date = updates.date;
                await supabase.from("transactions").update(dbUpdates).eq("id", id);
            }
        },
        [dbReady]
    );

    const deleteTransaction = useCallback(
        async (id: string) => {
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            if (dbReady && supabase) {
                await supabase.from("transactions").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpense;

    // ---- Orders ----
    const addOrder = useCallback(
        async (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "status">) => {
            const now = new Date().toISOString();
            const newOrder: Order = {
                ...order,
                id: generateId(),
                status: order.paymentMethod === "bank" ? "pending_payment" : "new",
                createdAt: now,
                updatedAt: now,
            };
            setOrders((prev) => [newOrder, ...prev]);
            if (dbReady && supabase) {
                // Map pending_payment to "new" for DB (column constraint)
                const dbStatus = newOrder.status === "pending_payment" ? "new" : newOrder.status;
                const insertData: Record<string, unknown> = {
                    id: newOrder.id,
                    items: newOrder.items,
                    total_price: newOrder.totalPrice,
                    customer_name: newOrder.customerName,
                    customer_phone: newOrder.customerPhone,
                    customer_address: newOrder.customerAddress,
                    customer_note: newOrder.customerNote || null,
                    payment_method: newOrder.paymentMethod || null,
                    status: dbStatus,
                };

                // Try with user_id first, fallback without it if table doesn't have the column
                if (newOrder.userId) {
                    insertData.user_id = newOrder.userId;
                }

                const { error } = await supabase.from("orders").insert(insertData);
                if (error) {
                    console.error("Order insert failed:", error.message);
                    // Retry without user_id in case the column doesn't exist
                    if (error.message.includes("user_id")) {
                        delete insertData.user_id;
                        const { error: retryError } = await supabase.from("orders").insert(insertData);
                        if (retryError) {
                            console.error("Order insert retry failed:", retryError.message);
                        }
                    }
                }
            }
        },
        [dbReady]
    );

    const updateOrderStatus = useCallback(
        async (id: string, status: Order["status"]) => {
            const now = new Date().toISOString();
            const order = orders.find((o) => o.id === id);
            const prevStatus = order?.status;

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === id ? { ...o, status, updatedAt: now } : o
                )
            );
            if (dbReady && supabase) {
                const { error } = await supabase
                    .from("orders")
                    .update({ status, updated_at: now })
                    .eq("id", id);
                if (error) {
                    console.error("Order status update failed:", error.message);
                }
            }

            const txPrefix = `Đơn hàng #${id.slice(0, 8).toUpperCase()}`;

            // Status changed TO completed → create income transaction
            if (status === "completed" && prevStatus !== "completed" && order) {
                await addTransaction({
                    type: "income",
                    amount: order.totalPrice,
                    description: `${txPrefix} — ${order.customerName}`,
                    category: "Bán hàng",
                    date: now,
                });
            }

            // Status changed FROM completed → remove associated transaction
            if (prevStatus === "completed" && status !== "completed") {
                const linkedTx = transactions.find(
                    (t) => t.description.startsWith(txPrefix) && t.type === "income"
                );
                if (linkedTx) {
                    await deleteTransaction(linkedTx.id);
                }
            }
        },
        [dbReady, orders, transactions, addTransaction, deleteTransaction]
    );

    const deleteOrder = useCallback(
        async (id: string) => {
            setOrders((prev) => prev.filter((o) => o.id !== id));
            if (dbReady && supabase) {
                await supabase.from("orders").delete().eq("id", id);
            }
        },
        [dbReady]
    );

    const getOrdersByUserId = useCallback(
        (userId: string) => orders.filter((o) => o.userId === userId),
        [orders]
    );

    return (
        <AdminContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                deleteProduct,
                getProduct,
                transactions,
                addTransaction,
                updateTransaction,
                deleteTransaction,
                totalIncome,
                totalExpense,
                profit,
                orders,
                addOrder,
                updateOrderStatus,
                deleteOrder,
                getOrdersByUserId,
                isLoading,
                reloadData: loadData,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}
