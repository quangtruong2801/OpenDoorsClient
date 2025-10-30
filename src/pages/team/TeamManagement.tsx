import {
  Table,
  Button,
  message,
  Space,
  Popconfirm,
  Card,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import axios from "~/api/config";
import AddTeamModal from "~/components/TeamModal";
import TeamFilter from "~/components/TeamManagementFilter";
import type { Management } from "~/types/Management";
import useDebounce from "~/hooks/useDebounce";

export default function TeamManagement() {
  const { t } = useTranslation();
  const [msgApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Bộ lọc
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    memberFilter: searchParams.get("memberFilter") || "",
  });
  const debouncedFilters = useDebounce(filters, 400);

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Management | null>(null);

  // FETCH DATA
  const fetchTeams = async () => {
    const res = await axios.get<Management[]>("/teams");
    let result = res.data;

    // Lọc theo tên
    result = result.filter((team) =>
      team.teamName.toLowerCase().includes(debouncedFilters.search.toLowerCase())
    );

    // Lọc theo số lượng thành viên
    if (debouncedFilters.memberFilter === "lt5")
      result = result.filter((t) => t.members < 5);
    if (debouncedFilters.memberFilter === "5to10")
      result = result.filter((t) => t.members >= 5 && t.members <= 10);
    if (debouncedFilters.memberFilter === "gt10")
      result = result.filter((t) => t.members > 10);

    const total = result.length;
    const data = result.slice((page - 1) * pageSize, page * pageSize);

    return { data, total };
  };

  const {
    data: teamData = { data: [], total: 0 },
    isLoading,
  } = useQuery({
    queryKey: ["teams", debouncedFilters, page, pageSize],
    queryFn: fetchTeams,
    placeholderData: keepPreviousData,
  });

  // MUTATIONS
  const addMutation = useMutation({
    mutationFn: (values: { teamName: string }) => axios.post("/teams", values),
    onSuccess: () => {
      msgApi.success(t("teamManagement.addSuccess"));
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => msgApi.error(t("teamManagement.addError")),
  });

  const updateMutation = useMutation({
    mutationFn: (values: { id: string; teamName: string }) =>
      axios.put(`/teams/${values.id}`, { teamName: values.teamName }),
    onSuccess: () => {
      msgApi.success(t("teamManagement.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => msgApi.error(t("teamManagement.updateError")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/teams/${id}`),
    onSuccess: () => {
      msgApi.success(t("teamManagement.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => msgApi.error(t("teamManagement.deleteError")),
  });

  // HANDLERS
  const handleFilterChange = (
    key: "search" | "memberFilter",
    value: string
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const reset = { search: "", memberFilter: "" };
    setFilters(reset);
    setSearchParams({});
    setPage(1);
  };

  const handleSaveTeam = async (values: { teamName: string }) => {
    if (editingTeam) {
      await updateMutation.mutateAsync({ id: editingTeam.id, ...values });
    } else {
      await addMutation.mutateAsync(values);
    }
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleEdit = (record: Management) => {
    setEditingTeam(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // COLUMNS
  const columns: ColumnsType<Management> = [
    {
      title: t("teamManagement.table.name"),
      dataIndex: "teamName",
      key: "teamName",
      width: 250,
    },
    {
      title: t("teamManagement.table.members"),
      dataIndex: "members",
      key: "members",
      width: 150,
      align: "center",
    },
    {
      title: t("teamManagement.table.actions"),
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={t("teamManagement.confirmDelete")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("teamManagement.delete")}
            cancelText={t("teamManagement.cancel")}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // RENDER
  return (
    <>
      {contextHolder}
      <Card title={t("teamManagement.title")} variant="borderless">
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Space>
            <TeamFilter
              search={filters.search}
              memberFilter={filters.memberFilter}
              onSearchChange={(v) => handleFilterChange("search", v)}
              onMemberFilterChange={(v) =>
                handleFilterChange("memberFilter", v)
              }
            />
            <Button icon={<ReloadOutlined />} onClick={handleResetFilters} />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTeam(null);
              setIsModalOpen(true);
            }}
          >
            {t("teamManagement.add")}
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={teamData.data}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: "max-content", y: 600 }}
          pagination={{
            current: page,
            pageSize,
            total: teamData.total,
            showSizeChanger: true,
            pageSizeOptions,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />

        <AddTeamModal
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTeam(null);
          }}
          onSubmit={handleSaveTeam}
          initialValues={editingTeam || undefined}
          isEdit={!!editingTeam}
        />
      </Card>
    </>
  );
}
