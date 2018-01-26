var MyTodoList = (function() {
    var defaults = {
            // CSS selectors and attributes that would be used by the JavaScript functions
            todoTask: "todo-task",
            todoHeader: "task-header",
            todoDate: "task-date",
            todoDescription: "task-description",
            taskId: "task-",
            formId: "todo-form",
            dataAttribute: "data",
            deleteDiv: "delete-div",
            remove: "remove",
            clearAll:"clearall"
        },
        codes = {
            "1": "#pending", // For pending tasks
            "2": "#inProgress",
            "3": "#completed"
        },
        data = {};

	var MyTodoList=function(){
		var _this=this;//必须是clickhandler之外的元素，不能是下面clickhandler之内的元素，这个之外的元素有MyToDoList的prototype，就可以用下面generateElement函数
		$('#datepicker').datepicker();
        _this.data = JSON.parse(localStorage.getItem('maizi')) || {};
        for (var property in _this.data) {//遍历每一个id
            if (_this.data.hasOwnProperty(property)) {
                _this.generateElement({//_this应该是指针
                    id: property,
                    code: _this.data[property].code,
                    title: _this.data[property].title,
                    date: _this.data[property].date,
                    description: _this.data[property].description
                });
            }
        }//做初始化，把存储在localstorage的数值提取出来
		$('#addItem').click(function(){
			var title=$(this).siblings('.addTitle').val(),//val()是函数
				description=$(this).siblings('.addDescriptions').val(),
				date=$(this).siblings('.addDate').val();
				id=Date.now()+'',//因为用户不会在1ms内写完一个todolist,所以可以用时间来生成每个元素独特的id			
				_this.generateElement({
					id:id,
					code:"1",
					title:title,
					date:date,
					description:description//这里出错了，写成了descriptions与下文description不一致
				});
				$(this).siblings('.addTitle').val(''),
				$(this).siblings('.addDescriptions').val(''),
				$(this).siblings('.addDate').val('');
	            _this.data[id] = {
	                code: "1",
	                title: title,
	                date: date,
	                description: description
	            };
	            _this.persistData();				
		});
		$('body').on('click','.todo-task .remove',function(){
			console.log('Remove!');
			var id=$(this).parent().attr('id').substring(defaults.taskId.length);//task-xxxxxxx变成xxxxxxx
			_this.removeElement({
				id: id
			});
            delete _this.data[id];
            _this.persistData();
		});
		$('#'+defaults.clearAll).on('click',function(){//我自己编写的函数，点击按钮清空url及本地存储的全部项目
			for(var eachId in _this.data)
			{
				_this.removeElement({
				id: eachId
			   });				
			}
			_this.data={};
			_this.persistData();
		});//怎么老是忘了分号，不重视啊咋地
        $.each(codes, function(index, value) {//实现从一个列表拖拽到另一个列表,index是codes遍历时候的序号，value是codes遍历到第几个时候的值
            $(value).droppable({//value其实就是id，这个语句就实现了三个列表可以drop，但是不明显看不出来
                drop: function(event, ui) {
                    var element = ui.helper,//ui.helper就是拖到的那个元素
                        id = element.attr('id').substring(defaults.taskId.length),
                        item = _this.data[id];
                    item.code = index;
                    _this.removeElement({
                        id: id
                    });
                    _this.generateElement({
                        id: id,
                        code: item.code,
                        title: item.title,
                        date: item.date,
                        description: item.description
                    });
                    _this.persistData();
                }
            });
        });
        $('#' + defaults.deleteDiv).droppable({//这段语句实现隐藏的删除区域的droppable
            drop: function(event, ui) {
                var element = ui.helper,
                    id = element.attr('id').substring(defaults.taskId.length);
                _this.removeElement({
                    id: id
                });
                delete _this.data[id];
                _this.persistData();

            }
        });
	}
    MyTodoList.prototype.persistData = function() {//这是自己编写的一个函数，实现存储到本地
        localStorage.setItem('maizi', JSON.stringify(this.data));
    }
    MyTodoList.prototype.generateElement = function(params) {
        var parent = $(codes[params.code]),
            wrapper;

        if (!parent) {
            return;
        }

        wrapper = $("<div />", {//产生一个class为defaults.todoTask、id为defaults.taskId + params.id的div
            "class": defaults.todoTask,
            "id": defaults.taskId + params.id,
            "data": params.id
        });
        $("<div />", {
            "class": defaults.remove,
            "text": 'X'
        }).appendTo(wrapper);

        $("<div />", {
            "class": defaults.todoHeader,
            "text": params.title
        }).appendTo(wrapper);

        $("<div />", {
            "class": defaults.todoDate,
            "text": params.date
        }).appendTo(wrapper);

        $("<div />", {
            "class": defaults.todoDescription,
            "text": params.description
        }).appendTo(wrapper);

        wrapper.appendTo(parent);
        wrapper.draggable({//实现每一个wrapper可拖动
            opacity: 0.5,
            start: function() {//start表示开始拖拽的时候，start和stop是event，可以通过这种方式添加一个回调函数
                $('#' + defaults.deleteDiv).show('fast');//选中id为'deleteDiv'的元素，并将其以fast的速度显示出来
            },
            stop: function() {
                $('#' + defaults.deleteDiv).hide('fast');

            }
        });

    };
    MyTodoList.prototype.removeElement = function(params) {
        $("#" + defaults.taskId + params.id).remove();
    };
    return MyTodoList;
})();//后面一对小括号立即调用
