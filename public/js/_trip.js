$('#model').attr('disabled', true)
$('#workType').attr('disabled', true)
$('#workObject').attr('disabled', true)
$('#workPlace').attr('disabled', true)

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