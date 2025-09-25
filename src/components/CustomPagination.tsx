import { Pagination } from "antd";

interface CustomPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: string[];
  onChange: (page: number, pageSize: number) => void;
}

export default function CustomPagination({
  current,
  pageSize,
  total,
  pageSizeOptions = ["5", "10", "20", "50", "100"],
  onChange,
}: CustomPaginationProps) {
  return (
    <div className="flex justify-end mt-4">
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        pageSizeOptions={pageSizeOptions}
        onChange={onChange}
      />
    </div>
  );
}
