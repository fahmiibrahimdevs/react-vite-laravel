import SearchEntries from "@/pages/Layout/Components/SearchEntries";
import Pagination from "@/pages/Layout/Components/Pagination";

export default function TodoTable({ rows, pagination, totalRows, totalPages, onEdit, onToggleComplete, onConfirmDelete }) {
    return (
        <>
            <SearchEntries showing={pagination.perPage} handleShow={pagination.handlePerPageChange} searchTerm={pagination.search} handleSearch={pagination.handleSearch} />
            <div className="table-responsive">
                <table className="tw-w-full tw-table-auto">
                    <thead className="tw-sticky tw-top-0">
                        <tr className="tw-text-gray-700">
                            <th width="8%" className="text-center tw-whitespace-nowrap">
                                No
                            </th>
                            <th className="tw-whitespace-nowrap">Title</th>
                            <th className="tw-whitespace-nowrap">Description</th>
                            <th width="12%" className="text-center tw-whitespace-nowrap">
                                Status
                            </th>
                            <th className="text-center tw-whitespace-nowrap">
                                <i className="fas fa-cog"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="text-center">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
                                    <td>{row.title}</td>
                                    <td>{row.description || "-"}</td>
                                    <td className="text-center">
                                        <button onClick={() => onToggleComplete(row)} className={`badge ${row.completed ? "badge-success" : "badge-warning"} tw-cursor-pointer`}>
                                            {row.completed ? "Done" : "Pending"}
                                        </button>
                                    </td>
                                    <td className="text-center tw-whitespace-nowrap">
                                        <button onClick={() => onEdit(row)} className="btn btn-primary mr-2" data-toggle="modal" data-target="#formDataModal">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button onClick={() => onConfirmDelete(row.id)} className="btn btn-danger">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No data available in the table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={pagination.currentPage} showing={pagination.perPage} totalRows={totalRows} totalPages={totalPages} handlePageChange={pagination.handlePageChange} />
        </>
    );
}
