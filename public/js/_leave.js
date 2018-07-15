// 获取休假信息
function getLeave() {
    let leave = {
        leaveType: $('#leaveType').val(),
        beginDate: $('#beginDate').val(),
        endDate: $('#endDate').val(),
        leaveDays: $('#leaveDays').val(),
        description: $('#description').val()
    }

    return leave
}