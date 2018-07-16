

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

disableTaskRelatedItems()