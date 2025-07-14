$(document).ready(function () {
    const table = $("#project-status").DataTable({
        paging: true,
        ordering: true,
        info: true,
        searching: true,
        columnDefs: [
            {
                targets: 0,
                searchable: false,
                orderable: false,
            },
            {
                // Cột Created At
                targets: 2,
                render: (data, type) => {
                    if (type === "filter" || type === "sort") {
                        return $("<div>").html(data).text().trim();
                    }
                    return data;
                }
            }
        ]
    });

    // Vẽ lại số thứ tự khi sắp xếp, tìm kiếm
    table.on('order.dt search.dt draw.dt', function () {
        let i = 1;
        table
            .cells(null, 0, { search: 'applied', order: 'applied' })
            .every(function () {
                this.data(i++);
            });
    }).draw();
});
