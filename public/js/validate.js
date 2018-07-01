function getWorklog(){
    let worklog = {
        workDate: $('#worklogDate').val(),
        workBeginTime: $('#workBeginTime').val(),
        workTimeLength: $('#workTimeLength').val(),
        workType: $('#workType').val(), 
        model: $('#model').val(),
        workPlace: $('#workPlace').val(), 
        workObject: $('#workObject').val(), 
        workContent: $('#workContent').val(),
    }
    
    return worklog
}


function showWarning(msg){
    $.notify({
            title: "输入错误 : ",
            message: msg,
            icon: 'fa fa-warning' 
        },{
            type: "danger",
            delay: "500"
        });
}

function checkInput(worklog){

    if(!worklog.workBeginTime){
        showWarning('开始时间不能为空！')
        return false
    }

    if(!worklog.workTimeLength){
        showWarning('工作时长不能为空！')
        return false
    }

    if(parseFloat(worklog.workTimeLength) <= 0) {
        showWarning('工作时长必须为大于零的数！')
        return false
    }

    if(!worklog.workType){
        showWarning('工作类型不能为空！')
        return false
    }

    if(!worklog.model){
        showWarning('所属型号不能为空！')
        return false
    }

    if(!worklog.workPlace){
        showWarning('工作对象不能为空！')
        return false
    }

    if(!worklog.workObject){
        showWarning('工作对象不能为空！')
        return false
    }

    if(!worklog.workContent){
        showWarning('工作内容不能为空！')
        return false
    }
    return true
}

/**
 * 初始化日期选择器
 */
function initDatePicker() {
    $('#worklogDate').datepicker({
        language: "zh-CN",
        weekStart: 1,
        todayBtn: true,
        todayHighlight: true,
        autoclose: true,
        format: 'yyyy-mm-dd',
        daysOfWeekHighlighted: '0, 6'
    })
    
    var now = new Date()
    $('#worklogDate').datepicker('setDate', now)
    $('#worklogDate').datepicker('setEndDate', now)
}