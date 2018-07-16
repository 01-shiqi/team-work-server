// 获取休假信息
function getLeave() {
    let leave = {
        leaveType: $('#leaveType').val(),
        beginDate: $('#dp-begin-date').val(),
        endDate: $('#dp-end-date').val(),
        leaveDays: $('#leaveDays').val(),
        description: $('#description').val()
    }

    return leave
}