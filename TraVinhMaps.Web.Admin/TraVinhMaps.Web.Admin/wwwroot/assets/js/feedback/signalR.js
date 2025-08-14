
// ================== KẾT NỐI SIGNALR ==================
const connection = new signalR.HubConnectionBuilder()
  .withUrl(window.apiBaseUrl + "dashboardHub")
  .build();

// ================== DATATABLES SETUP (nếu có) ==================
let dt = null;

function initTable() {
  // Nếu đã có DataTables -> lấy instance; nếu chưa -> khởi tạo
  if (window.jQuery && $.fn && $.fn.DataTable) {
    if ($.fn.dataTable.isDataTable('#basic-9')) {
      dt = $('#basic-9').DataTable();
    } else {
      dt = $('#basic-9').DataTable({
        pageLength: 10,
        // Tắt ordering để giữ thứ tự chèn (bản ghi mới luôn nằm cuối)
        ordering: false,
        columnDefs: [
          { targets: 0, orderable: false, searchable: false } // cột STT
        ]
      });
    }

    // Đánh số STT theo offset trang hiện tại
    dt.on('draw.dt', function () {
      const info = dt.page.info();
      dt.column(0, { page: 'current' }).nodes().each(function (cell, i) {
        cell.innerHTML = info.start + i + 1;
      });
    });

    // Gọi 1 lần để set STT đúng sau khi init
    dt.draw(false);
  }
}

// ================== FALLBACK PHÂN TRANG THỦ CÔNG (khi KHÔNG dùng DataTables) ==================
const FALLBACK = {
  enabled: false,
  itemsPerPage: 10,
  currentPage: 1
};

function fallbackEnsureInit() {
  if (dt) return; // đã có DataTables thì không dùng fallback
  FALLBACK.enabled = true;
  const $table = $('#basic-9');
  const ip = parseInt($table.data('items-per-page'), 10);
  if (!isNaN(ip) && ip > 0) FALLBACK.itemsPerPage = ip;
  const cp = parseInt($table.data('current-page'), 10);
  if (!isNaN(cp) && cp > 0) FALLBACK.currentPage = cp;
  fallbackRenderPage(FALLBACK.currentPage);
}

function fallbackRenderPage(page) {
  if (!FALLBACK.enabled) return;
  const $rows = $('#basic-9 tbody tr');
  const total = $rows.length;
  const pageCount = Math.max(1, Math.ceil(total / FALLBACK.itemsPerPage));
  FALLBACK.currentPage = Math.max(1, Math.min(page, pageCount));

  $rows.hide();
  const start = (FALLBACK.currentPage - 1) * FALLBACK.itemsPerPage;
  $rows.slice(start, start + FALLBACK.itemsPerPage).show();

  // STT theo offset
  $('#basic-9 tbody tr:visible').each(function (i) {
    $(this).find('td:first').text(start + i + 1);
  });

  // Lưu lại current page để lần sau vẫn giữ
  $('#basic-9').attr('data-current-page', FALLBACK.currentPage);
}

function fallbackGoLastPage() {
  const $rows = $('#basic-9 tbody tr');
  const total = $rows.length;
  const pageCount = Math.max(1, Math.ceil(total / FALLBACK.itemsPerPage));
  fallbackRenderPage(pageCount);
}

// ================== UTILITIES ==================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function actionHtml(id) {
  const safeId = id || '';
  return `
    <ul class="action d-flex justify-content-center align-items-center">
      <li>
        <a class="details" href="/Feedback/${safeId}" title="Details">
          <i class="fa fa-eye"></i>
        </a>
      </li>
    </ul>`;
}

// ================== LẮNG NGHE SỰ KIỆN SIGNALR ==================
connection.on("ReceiveFeedback", function (feedback) {
  console.log("New feedback object received, updating UI:", feedback);
  console.log("Raw createdAt value:", feedback.createdAt);
  console.log("Parsed date:", new Date(feedback.createdAt));

  const username = escapeHtml(feedback?.username || "Unknown");
  const content = escapeHtml(feedback?.content || "");
  const createdAtStr = formatDate(feedback?.createdAt);
  const id = feedback?.id || "";

  if (dt) {
    // TH: DataTables — thêm bằng API, NHẢY VỀ TRANG CUỐI
    dt.row.add([
      '', // STT sẽ được set ở draw callback
      `<div class="user-names"><p>${username}</p></div>`,
      content,
      createdAtStr,
      actionHtml(id)
    ]);
    // Nhảy tới trang cuối sau khi thêm (đúng kỳ vọng "trang 11, dòng 108")
    dt.page('last').draw(false);
  } else {
    // TH: Fallback — append DOM, rồi render trang cuối + đánh STT offset
    const newRowHtml = `
      <tr data-admin-id="${id}">
        <td></td>
        <td>
          <div class="user-names"><p>${username}</p></div>
        </td>
        <td>${content}</td>
        <td>${createdAtStr}</td>
        <td>${actionHtml(id)}</td>
      </tr>
    `;
    $("#basic-9 tbody").append(newRowHtml);
    fallbackGoLastPage(); // Nhảy về trang cuối
  }
});

// ================== KHỞI ĐỘNG ==================
$(function () {
  initTable();         // ưu tiên DataTables nếu có
  fallbackEnsureInit(); // nếu không có DataTables thì dùng fallback
});

async function start() {
  try {
    await connection.start();
    console.log("SignalR Connected.");
    const userRole = getUserRoleFromYourSystem();
    if (userRole === "super-admin" || userRole === "admin") {
      connection.invoke("JoinAdminGroup", userRole).catch(function (err) {
        return console.error(err.toString());
      });
    }
  } catch (err) {
    console.error(err);
    setTimeout(start, 5000);
  }
}

function getUserRoleFromYourSystem() {
  return "super-admin";
}

start();

