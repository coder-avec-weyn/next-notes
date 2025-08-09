import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminAccess,
  createServiceRoleClient,
  validateAndSanitizeInput,
  logSQLPreview,
} from "@/utils/auth";

// POST - Alter table structure (admin/service role only)
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
      operation: { type: "string", required: true },
      columnName: { type: "string", required: false, maxLength: 63 },
      columnType: { type: "string", required: false },
      newColumnName: { type: "string", required: false, maxLength: 63 },
      constraints: { type: "array", required: false },
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

    const {
      tableName,
      operation,
      columnName,
      columnType,
      newColumnName,
      constraints = [],
    } = sanitized;

    // Validate table and column names
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 },
      );
    }

    if (columnName && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      return NextResponse.json(
        { error: "Invalid column name" },
        { status: 400 },
      );
    }

    // Create service role client for admin operations
    const supabase = await createServiceRoleClient();

    let alterSQL = "";

    switch (operation.toLowerCase()) {
      case "add_column":
        if (!columnName || !columnType) {
          return NextResponse.json(
            { error: "Column name and type required for add_column operation" },
            { status: 400 },
          );
        }

        let columnDef = `${columnName} ${columnType}`;
        if (constraints.includes("NOT NULL")) columnDef += " NOT NULL";
        if (constraints.includes("UNIQUE")) columnDef += " UNIQUE";

        alterSQL = `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${columnDef}`;
        break;

      case "drop_column":
        if (!columnName) {
          return NextResponse.json(
            { error: "Column name required for drop_column operation" },
            { status: 400 },
          );
        }
        alterSQL = `ALTER TABLE public.${tableName} DROP COLUMN IF EXISTS ${columnName}`;
        break;

      case "rename_column":
        if (!columnName || !newColumnName) {
          return NextResponse.json(
            {
              error:
                "Both columnName and newColumnName required for rename_column operation",
            },
            { status: 400 },
          );
        }
        alterSQL = `ALTER TABLE public.${tableName} RENAME COLUMN ${columnName} TO ${newColumnName}`;
        break;

      case "modify_column":
        if (!columnName || !columnType) {
          return NextResponse.json(
            {
              error:
                "Column name and type required for modify_column operation",
            },
            { status: 400 },
          );
        }
        alterSQL = `ALTER TABLE public.${tableName} ALTER COLUMN ${columnName} TYPE ${columnType}`;
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid operation. Supported: add_column, drop_column, rename_column, modify_column",
          },
          { status: 400 },
        );
    }

    logSQLPreview("ALTER TABLE", tableName, {
      operation,
      columnName,
      columnType,
    });

    // Execute alter table operation
    const { error: alterError } = await supabase.rpc("exec_sql", {
      sql: alterSQL,
    });

    if (alterError) {
      console.error("Error altering table:", alterError);
      return NextResponse.json(
        { error: "Failed to alter table", details: alterError.message },
        { status: 500 },
      );
    }

    console.log(
      `[${new Date().toISOString()}] Table altered successfully: ${tableName} (${operation}) by user ${user.id}`,
    );

    return NextResponse.json({
      message: "Table altered successfully",
      tableName,
      operation,
      sql: alterSQL,
    });
  } catch (error: any) {
    console.error("Unexpected error in alter-table:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
