
// 设置日期的当前时间和截至时间
var now = new Date()
$('#beginTime').datepicker('setDate', now)
$('#endTime').datepicker('setDate', now)

		
/**
 * 根据对话框中的内容生成task对象
 */
function getTask() {
    let task = {
        type: $('#taskType').val(),
        model: $('#model').val(),
        workObject: $('#workObject').val(),
        workPlace: $('#workPlace').val(),
        beginTime: $('#beginTime').val(),
        endTime: $('#endTime').val(),
        personHours: $('#personHours').val(), 
        state: $('#task-dialog').attr('data-task-state'),  
        executor: $('#executor').val(), 
        name: $('#taskName').val(), 
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
        $('#endTime').addClass('is-invalid')
        return false
    }
    if(!task.name){
        $('#taskName').addClass('is-invalid')
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
