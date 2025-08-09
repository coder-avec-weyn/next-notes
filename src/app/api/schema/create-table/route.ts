import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminAccess,
  createServiceRoleClient,
  validateAndSanitizeInput,
  logSQLPreview,
} from "@/utils/auth";

// POST - Create a new table (admin/service role only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, user, error: authError } = await verifyAdminAccess();
    if (!isAdmin || authError) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const requestData = await request.json();

    // Validate input
    const schema = {
      tableName: { type: "string", required: true, maxLength: 63 },
      columns: { type: "array", required: true },
      enableRLS: { type: "boolean", required: false },
    };

    const { isValid, sanitized, errors } = validateAndSanitizeInput(
      requestData,
      schema,
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { tableName, columns, enableRLS = true } = sanitized;

    // Validate table name (alphanumeric and underscores only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json(
        {
          error:
            "Invalid table name. Use only letters, numbers, and underscores.",
        },
        { status: 400 },
      );
    }

    // Validate columns structure
    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: "Columns must be a non-empty array" },
        { status: 400 },
      );
    }

    // Create service role client for admin operations
    const supabase = await createServiceRoleClient();

    // Build CREATE TABLE SQL
    const columnDefinitions = columns
      .map((col: any) => {
        if (!col.name || !col.type) {
          throw new Error("Each column must have name and type");
        }

        let definition = `${col.name} ${col.type}`;
        if (col.primaryKey) definition += " PRIMARY KEY";
        if (col.notNull) definition += " NOT NULL";
        if (col.unique) definition += " UNIQUE";
        if (col.defaultValue) definition += ` DEFAULT ${col.defaultValue}`;

        return definition;
      })
      .join(", ");

    const createTableSQL = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columnDefinitions})`;

    logSQLPreview("CREATE TABLE", tableName, { columns: columns.length });

    // Execute table creation
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (createError) {
      console.error("Error creating table:", createError);
      return NextResponse.json(
        { error: "Failed to create table", details: createError.message },
        { status: 500 },
      );
    }

    // Enable RLS if requested
    if (enableRLS) {
      const enableRLSSQL = `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY`;
      const { error: rlsError } = await supabase.rpc("exec_sql", {
        sql: enableRLSSQL,
      });

      if (rlsError) {
        console.warn("Warning: Failed to enable RLS:", rlsError);
      }
    }

    // Add to realtime publication
    const realtimeSQL = `ALTER PUBLICATION supabase_realtime ADD TABLE public.${tableName}`;
    const { error: realtimeError } = await supabase.rpc("exec_sql", {
      sql: realtimeSQL,
    });

    if (realtimeError) {
      console.warn("Warning: Failed to add table to realtime:", realtimeError);
    }

    console.log(
      `[${new Date().toISOString()}] Table created successfully: ${tableName} by user ${user.id}`,
    );

    return NextResponse.json(
      {
        message: "Table created successfully",
        tableName,
        enabledRLS: enableRLS,
        addedToRealtime: !realtimeError,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Unexpected error in create-table:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
