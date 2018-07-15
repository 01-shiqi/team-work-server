// 获取出差信息
function getTrip() {
    let trip = {
        leaveType: $('#leaveType').val(),
        beginDate: $('#beginDate').val(),
        endDate: $('#endDate').val(),
        leaveDays: $('#leaveDays').val(),
        description: $('#description').val()
    }

    return trip
}