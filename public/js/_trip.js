

// 获取出差信息
function getTrip() {
    let trip = {
        taskID: $('#task').val(),
        model: $('#model').val(),
        workType: $('#workType').val(), 
        workObject: $('#workObject').val(), 
        workPlace: $('#workPlace').val(), 
        planBeginDate: $('#planBeginDate').val(),
        planEndDate: $('#planEndDate').val(),
        actualBeginDate: $('#actualBeginDate').val(),
        actualEndDate: $('#actualEndDate').val(),       
        tripWork: $('#tripWork').val(),  
        state: $('#edit-dialog').data('state')     
    }

    return trip
}

function disableTaskRelatedItems() {
    $('#model').attr('disabled', true)
    $('#workType').attr('disabled', true)
    $('#workObject').attr('disabled', true)
    $('#workPlace').attr('disabled', true)
}

/**
 * 计算日期间隔的天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcDateDiff(beginDate, endDate) {
    if(beginDate == '' || endDate == '') {
        return
    }
    let beginDateTime = new Date(beginDate.replace(/\-/g, "\/"))
    let endDateTime = new Date(endDate.replace(/\-/g, "\/"))

    let diffMilliseconds = endDateTime - beginDateTime
    let diff = Math.abs(diffMilliseconds / 86400000 + 1)
    return diff
}

/**
 * 计算计划出差天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcPlanTripDays(beginDate, endDate) {
    let days = calcDateDiff(beginDate, endDate)
    if(days) {
        $('#planTripDays').html(days)
    }
}

/**
 * 计算实际出差天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcActualTripDays(beginDate, endDate) {
    let days = calcDateDiff(beginDate, endDate)
    if(days) {
        $('#actualTripDays').html(days)
    }
}

$('#planBeginDate').bind('change', function(){
    calcPlanTripDays($('#planBeginDate').val(), $('#planEndDate').val())
})

$('#planEndDate').bind('change', function(){
    calcPlanTripDays($('#planBeginDate').val(), $('#planEndDate').val())
})

$('#actualBeginDate').bind('change', function(){
    calcPlanTripDays($('#actualBeginDate').val(), $('#actualEndDate').val())
})

$('#actualEndDate').bind('change', function(){
    calcPlanTripDays($('#actualBeginDate').val(), $('#actualEndDate').val())
})





disableTaskRelatedItems()