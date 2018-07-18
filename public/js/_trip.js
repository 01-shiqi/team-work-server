

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
        planTripDays: $('#span-plan-trip-days').html(),
        actualBeginDate: $('#actualBeginDate').val(),
        actualEndDate: $('#actualEndDate').val(),       
        actualTripDays: $('#span-actual-trip-days').html(),
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


// 验证输入的有效性
function checkTripInput(trip, editMode) {

    if(!trip.taskID){
        $('#task').addClass('is-invalid')
        showWarning('任务名称不能为空')
        return false 
    }

    if(editMode == 'finish-trip') {
        if(!trip.actualBeginDate){
            $('#actualBeginDate').addClass('is-invalid')
            return false
        }

        if(!trip.actualEndDate){
            $('#actualEndDate').addClass('is-invalid')
            return false
        }
        if(!trip.tripWork){
            $('#tripWork').addClass('is-invalid')
            return false
        }
        return true
    }
    else {
        return true
    }
}



/**
 * 计算计划出差天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcPlanTripDays(beginDate, endDate) {
    let days = calcDateDiff(beginDate, endDate)
    if(days) {
        $('#span-plan-trip-days').html(days)
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
        $('#span-actual-trip-days').html(days)
    }
}

$('#planBeginDate').bind('change', function(){
    calcPlanTripDays($('#planBeginDate').val(), $('#planEndDate').val())
})

$('#planEndDate').bind('change', function(){
    calcPlanTripDays($('#planBeginDate').val(), $('#planEndDate').val())
})

$('#actualBeginDate').bind('change', function(){
    calcActualTripDays($('#actualBeginDate').val(), $('#actualEndDate').val())
})

$('#actualEndDate').bind('change', function(){
    calcActualTripDays($('#actualBeginDate').val(), $('#actualEndDate').val())
})





disableTaskRelatedItems()