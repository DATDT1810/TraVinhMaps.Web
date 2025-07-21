// --- PHẦN KẾT NỐI SIGNALR ---
const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:7162/dashboardHub") // Đảm bảo URL này đúng
  .build();

// --- PHẦN LẮNG NGHE SỰ KIỆN ---
connection.on("ReceiveFeedback", function (feedback) {
  console.log("New feedback object received, updating UI:", feedback);
  console.log("Raw createdAt value:", feedback.createdAt);
  console.log("Parsed date:", new Date(feedback.createdAt));

  const newRowHtml = `
        <tr data-admin-id="${feedback.id || ""}">
            <td>1</td>
            <td>
                <div class="user-names">
                    <p>${feedback.username || "Unknown"}</p>
                </div>
            </td>
            <td>${feedback.content || ""}</td>
            <td>${formatDate(feedback.createdAt)}</td>
            <td>
                <ul class="action">
                    <li>
                        <a class="details" href="/Feedback/Details/${
                          feedback.id || ""
                        }" title="Details">
                            <i class="fa fa-eye"></i>
                        </a>
                    </li>
                </ul>
            </td>
        </tr>
    `;

  $("#basic-9 tbody").prepend(newRowHtml); // Hoặc dùng DataTables nếu có
  updateRowNumbers();
});

// --- CÁC HÀM TIỆN ÍCH ĐỂ CẬP NHẬT GIAO DIỆN ---
function updateRowNumbers() {
  $("#basic-9 tbody tr").each(function (index) {
    $(this)
      .find("td:first")
      .text(index + 1);
  });
}

function formatDate(dateString) {
  if (!dateString) {
    console.log("dateString is null or undefined");
    return "N/A";
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.log("Invalid Date for dateString:", dateString);
    return "N/A";
  }
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- PHẦN KHỞI ĐỘNG KẾT NỐI ---
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
