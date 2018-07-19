
		
/**
 * 根据对话框中的内容生成task对象
 */
function getTask() {
    let task = {
        type: $('#taskType').val(),
        model: $('#model').val(),
        workObject: $('#workObject').val(),
        workPlace: $('#workPlace').val(),
        beginTime: $('#dp-begin-time').val(),
        endTime: $('#dp-end-time').val(),
        personHours: $('#personHours').val(), 
        state: $('#task-dialog').attr('data-task-state'),  
        executor: $('#executor').val(), 
        name: $('#input-task-name').val(), 
        content: $('#taskContent').val(),
    }
    
    return task
}

/**
 * 验证task输入的有效性
 * @param {*} task 
 */
function checkTaskInputValid(task) {

    if(task.endTime < task.beginTime){
        $('#dp-end-time').addClass('is-invalid')
        return false
    }
    if(!task.name){
        $('#input-task-name').addClass('is-invalid')
        return false
    }

    if(!task.content){
        $('#taskContent').addClass('is-invalid')
        return false
    }
    return true
}

/**
 * 绑定输入框输入事件，如果有输入，则取消红色边框显示
 */
$(".input-no-empty").bind("input propertychange change",function(event) {
    if($(this).val() != '') {
        $(this).removeClass('is-invalid')
    }
})



/**
 * 计算完成任务的实际天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcDaysOfTask(beginDate, endDate) {
    if(!beginDate || !endDate) {
        return
    }

    let taskType = $('#taskType').val()
    let days = null
    let daysType = null

    // 出差任务计算天数，非出差任务计算工作日数
    if(taskType == '出差') {
        days = calcDateDiff(beginDate, endDate)
        daysType = '天'
    } else {
        days = calcWorkDayDiff(beginDate, endDate)
        daysType = '个工作日'
    }
    
    if(days) {
        $('#span-task-days').html(days)
        $('#span-days-or-workdays').html(daysType)
        setSelect2Value('#personHours', days * 6)
    }
}

$('#taskType').bind('change', function(){
    calcDaysOfTask($('#dp-begin-time').val(), $('#dp-end-time').val())
})

$('#dp-begin-time').bind('change', function(){
    calcDaysOfTask($('#dp-begin-time').val(), $('#dp-end-time').val())
})

$('#dp-end-time').bind('change', function(){
    calcDaysOfTask($('#dp-begin-time').val(), $('#dp-end-time').val())
})

// 设置日期的当前时间和截至时间
var now = new Date()
$('#dp-begin-time').datepicker('setDate', now)
$('#dp-end-time').datepicker('setDate', now)