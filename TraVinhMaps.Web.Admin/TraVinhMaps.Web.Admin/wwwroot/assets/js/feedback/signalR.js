// --- PHẦN KẾT NỐI SIGNALR ---
const connection = new signalR.HubConnectionBuilder()
  .withUrl(window.apiBaseUrl + "dashboardHub")
  .build();

// --- PHẦN LẮNG NGHE SỰ KIỆN ---
connection.on("ReceiveFeedback", function (feedback) {
  console.log("New feedback object received, updating UI:", feedback);
  console.log("Raw createdAt value:", feedback.createdAt);
  console.log("Parsed date:", new Date(feedback.createdAt));

  // Lấy STT lớn nhất hiện có trong bảng
  let lastNumber = 0;
  $("#basic-9 tbody tr").each(function () {
    const currentNum = parseInt($(this).find("td:first").text(), 10);
    if (!isNaN(currentNum) && currentNum > lastNumber) {
      lastNumber = currentNum;
    }
  });

  // STT mới = lớn nhất + 1
  // const newNumber = lastNumber + 1;

  const newRowHtml = `
        <tr data-admin-id="${feedback.id || ""}">
            <td></td>
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
                        <a class="details" href="/Feedback/Details/${feedback.id || ""}" title="Details">
                            <i class="fa fa-eye"></i>
                        </a>
                    </li>
                </ul>
            </td>
        </tr>
    `;

  // Chèn feedback mới lên đầu nhưng vẫn giữ STT liên tục
  $("#basic-9 tbody").append(newRowHtml);
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
    return "N/A";
  }
  // new Date() sẽ phân giải chuỗi ISO 8601 từ backend một cách đáng tin cậy
  const date = new Date(dateString); 
  if (isNaN(date.getTime())) {
    return "N/A";
  }
  // toLocaleString sẽ định dạng ngày giờ theo múi giờ và ngôn ngữ Việt Nam
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
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
