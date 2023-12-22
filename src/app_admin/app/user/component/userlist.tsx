"use client";
// React or Next
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// server action
import { userDeleteAction } from "@/components/common/formActions/userForm";

// tanstack
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// icon
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

// shadcn ui
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AttributesType = {
  Name: string;
  Value: string;
};

type UsersType = {
  Username: string;
  Attributes: AttributesType[];
  UserCreateDate: string;
  UserLastModifiedDate: string;
  Enabled: true;
  UserStatus: string;
};

export const columns = () => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteUserRef = useRef<String>();

  const col: ColumnDef<UsersType>[] = [
    {
      accessorKey: "Username",
      header: "ユーザー名",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("Username")}</div>
      ),
    },
    {
      accessorKey: "Attributes",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            メールアドレス
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const email: AttributesType[] = row.getValue("Attributes");

        return (
          <>
            {email.map((item: AttributesType) => {
              return item.Name == "email" && item.Value;
            })}
          </>
        );
      },
    },
    {
      accessorKey: "UserCreateDate",
      header: () => <div>作成日</div>,
      cell: ({ row }) => {
        const user_create_date = new Date(row.getValue("UserCreateDate"));
        return (
          <div className="font-medium">
            {String(user_create_date.toLocaleString())}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const Username = row.original.Username;

        const deleteUser = async (delete_user: string) => {
          deleteUserRef.current = delete_user;
          if (dialogRef.current) {
            dialogRef.current.showModal();
          }
        };

        const dialogSelect = async (selected: string) => {
          if (selected == "cancel" && dialogRef.current) {
            dialogRef.current.close();
            return;
          } else if (selected == "ok" && dialogRef.current) {
            const res = await userDeleteAction(String(deleteUserRef.current));
            if (res) {
              router.refresh();

              dialogRef.current.close();
            }
          }
        };

        const dialogClose = () => {
          if (dialogRef.current) {
            dialogRef.current.close();
          }
        };

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href={`user/${Username}`}>ユーザーの情報を変更</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={(event) => event.preventDefault}>
                  <button
                    onClick={(event) => {
                      event.preventDefault;
                      deleteUser(Username);
                    }}
                  >
                    ユーザーを削除
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <dialog
              ref={dialogRef}
              onClick={dialogClose}
              className="border bg-white rounded shadow-lg w-[24rem] min-h-[9rem]"
            >
              <div onClick={(e) => e.stopPropagation()}>
                <p className="p-5">ユーザーを削除します。</p>
                <div className="flex w-full justify-end gap-6 p-5">
                  <Button
                    onClick={() => dialogSelect("cancel")}
                    className="text-sm py-1 px-2 min-w-[5rem]"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={() => dialogSelect("ok")}
                    className="bg-red-500 hover:bg-red-500/90 text-sm py-1 px-2 min-w-[5rem]"
                  >
                    削除
                  </Button>
                </div>
              </div>
            </dialog>
          </>
        );
      },
    },
  ];

  return col;
};

export default function DataTableDemo({ userData }: { userData: UsersType[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<any>({});

  const table = useReactTable({
    data: userData,
    columns: columns(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      {/* userアクション */}
      <div className="flex items-center py-4 justify-between">
        <div></div>
        <div>
          <Link
            href={"user/create"}
            className="ml-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            ユーザー作成
          </Link>
        </div>
      </div>

      {/* 一覧表示 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronDown className="rotate-90" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next <ChevronDown className="rotate-[-90deg]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
