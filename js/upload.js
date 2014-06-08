/**
 * @description 图片上传组件
 * @type {Array}
 * @author wyj on 14/5/5
 */
var itemList = [];
var $sortlist = $("#choiceFileList");
var maxPicLength = 9;
var printSrcResFilesList=[];
var printIconResFilesList = [];
var uploadFilesList = [];
var choiceLength = 0;
var resFilesList = [];//存储图片
var resIconFilesList = [];//存储图标
var filterFilesList = [];//过滤图片
var file_setting_type_list = ["jpg","jpeg","bmp","png","gif"];
var checkList = [];
var sortOption = {
    opacity : 0.6,
    revert : true,
    cursor : 'move',
    handle : '.isCheck'
};
var totalCount=0;
//文件上传分页
var pageOption1 = {
    PAGE:1,
    PAGE_SIZE:15,
    FILTER_RESULT:[]			//筛选结果
};
//资源库分页
var pageOption2 = {
    PAGE:1,
    PAGE_SIZE:15,
    FILTER_RESULT:[],				//筛选结果
    FILTER_NAME:'', 				//筛选关键字
    FILTER_GROUP_KEY:0,				//筛选默认组
    SORT_DESC:true,
    PAGE_BTN:"PageBtn2"
};
//图标分页
var pageOption3 = {
    PAGE:1,
    PAGE_SIZE:15,
    FILTER_RESULT:[],				//筛选结果
    FILTER_NAME:'', 				//筛选关键字
    FILTER_GROUP_KEY:0,				//筛选默认组
    SORT_DESC:true,
    PAGE_BTN:"PageBtn3"
};

function addEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
}

function createImage(src,id,option){
    var container = document.createElement("li");
    container.setAttribute("id",id);
    //设置选中
    if(typeof(option.isCheck) != 'undefined'&& option.isCheck ==true)
        $(container).addClass("isCheck ");
    //绑定事件
    if(typeof(option.type) != 'undefined'&& option.type ==1){
        addEventHandler(container,"click",function(){
            addPic(container,id);
        });
    }
    //功能按钮
    var checkImg = "<div class='fnicon'> </div>";
    var $checkImg = $(checkImg);
    $(container).append($checkImg);
    addEventHandler($($checkImg).get(0),"click",function(){
        removePic($($checkImg).get(0),id);
    });
    var containerSpan = document.createElement("span");
    container.appendChild(containerSpan);
    //文件名称
    var filenameDiv = document.createElement("div");
    filenameDiv.setAttribute("class","filename");
    if("filename" in option){
        filenameDiv.innerHTML=option.filename;
    }
    container.appendChild(filenameDiv);
    if(typeof(option.type) != 'undefined'&& option.type ==2){
        addEventHandler(checkImg,"click",function(){
            removePic(checkImg,id);
        });
    }
    //图片
    var newImg = document.createElement("img");
    containerSpan.appendChild(newImg);
    newImg.onload = function () {
        //fadeIn(newImg, 0);
        var imgW,imgH;
        imgW =  newImg.width
        imgH = 	newImg.height;
        if(imgW > imgH){
            newImg.setAttribute("width","78");
        }else{
            newImg.setAttribute("height","80");
        }
    };
    newImg.src = src;
    return container;
}

function addImage(src,id,name) {
    var checkFlag = true;
    if((maxPicLength-choiceLength)==0){
        checkFlag = false;
    }
    uploadFilesList.push(createImage(src, id,{type:1,isCheck:checkFlag,filename:name}));
    //存储结果
    resFilesList.unshift({
        id:id,
        server_path:src,
        isCheck:checkFlag,
        belongId:$("#albumId").val(),
        filename:name
    });
    $("#showNewUploadFileContent").removeClass("startToUpload");
    //向上传页面添加图片
    document.getElementById("showNewUploadFileContent").appendChild(
        createImage(src, id,{type:1,isCheck:checkFlag,filename:name}));
    //向选择页添加图片
    if(checkFlag){
        document.getElementById("choiceFileList").appendChild(createImage(src, id,{type:2,isCheck:true,filename:name}));
        $("#choiceFileList").sortable();
        reBindChoiceFileList();
        choiceLength++;
    }
    //向资源库添加图片
    pageOption2.FILTER_RESULT= resFilesList;
    showResFilesList();
}

function fadeIn(element, opacity) {
    var reduceOpacityBy = 5;
    var rate = 30;	// 15 fps
    if (opacity < 100) {
        opacity += reduceOpacityBy;
        if (opacity > 100) {
            opacity = 100;
        }
        if (element.filters) {
            try {
                element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
            } catch (e) {
                // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
            }
        } else {
            element.style.opacity = opacity / 100;
        }
    }
    if (opacity < 100) {
        setTimeout(function () {
            fadeIn(element, opacity);
        }, rate);
    }
}

function changeAlbumId(obj) {
    var id = $.trim($(obj).val());
    if (id.length > 0) {
        options.post_params = {
            "album_id" : id
        };
        doUpload();
    }
}
function popupAddProp() {
    art.dialog.prompt('请输入文件夹名称', function(data, topWin) {
        if (data.trim() == '') {
            art.dialog.alert('文件夹名称不能为空！');
            return false;
        }
        paramName = data;
        $.ajax({
            type : "post",
            url : "/mviews/album/albumajaxAdd.action",
            data : {
                name : paramName,
                adesc : ''
            },
            success : function(result) {
                $("#albumId").append(
                    '<option value="' + result + '" selected="selected">'
                        + data + '</option>');
            }
        });
    });
}

function addPic(obj, id) {
    var isCheck = $(obj).hasClass("isCheck");
    if(maxPicLength==1&& isCheck==false){
        $("#choiceFileList .fnicon").click();
    }
    var $choiceFileList = $("#choiceFileList");
    if (isCheck) {
        var list = $("li",$choiceFileList);
        $.each(list, function(){
            var target_id = $(this).attr("id");
            if(id === target_id){
                $(this).find(".fnicon").click();
            }
        });
        $("#"+id,$("#showNewUploadFileContent")).removeClass("isCheck");
        $("#"+id,$("#showResFilesContent")).removeClass("isCheck");
        $("#"+id,$("#choiceFileList")).removeClass("isCheck");
        //$choiceFileList.sortable();
        resetCheckOfFilesList(id,false);
        choiceLength--;
    } else if((maxPicLength-choiceLength)!=0){
        itemList.push(obj);
        $("#"+id,$("#showNewUploadFileContent")).addClass("isCheck");
        $("#"+id,$("#showResFilesContent")).addClass("isCheck");
        $("#"+id,$("#iconContent")).addClass("isCheck");
        $temp = $(obj).clone();
        $choiceFileList.append($temp);
        $(".fnicon",$temp).bind("click",function(){
            removePic($(this),$temp.attr("id"))
        });
        $choiceFileList.sortable();
        resetCheckOfFilesList(id,true);
        choiceLength++;
    }
    reBindChoiceFileList();
}
function removePic(obj,id){
	$("#"+$(obj).parents(".isCheck").attr("id"),$("#showNewUploadFileContent")).removeClass("isCheck");
	$("#"+$(obj).parents(".isCheck").attr("id"),$("#showResFilesContent")).removeClass("isCheck");
	$("#"+$(obj).parents("li:first").attr("id"),$("#iconContent")).removeClass("isCheck");
	$(obj).parents(".isCheck").remove();
	resetCheckOfFilesList(id,false);
	choiceLength--;
}
function resetCheckOfFilesList(id,flag){
	for(var i = 0,len=resFilesList.length;i<len;i++){
		if(id==resFilesList[i].id){
			resFilesList[i].isCheck = flag;
		}
	}
}
function loadSrcResFilesList(){
	$("#showResFilesContent").addClass("ajaxLoading2").find(".noFile").text("正在加载中...");
	$.ajax({
		type	: "post",
		url		: "/mviews/album/albumajaxopen",
		data	: {},
		cache	: false,
		success	: function(result){
			printSrcResFilesList = result;
			$("#showResFilesContent").removeClass("ajaxLoading2")
			// 重新初始化FileList
			initResFilesList();
			// 再次调用显示资源库文件
			showResFilesList();
			initSearchMoudle();
		}
	});
}
//取源数据进行组装实际使用的资源列表数据
function initResFilesList(){
	var newResFilesList = [];
	$.each(printSrcResFilesList, function(i, srcFile){
		var newFile = {};
		newFile["id"] = srcFile["att_id"];
		newFile["server_path"] = srcFile["server_path"];
		newFile["isCheck"] = false;
		//newFile["belong_id"] = srcFile["belong_id"];
		newFile["filename"] = srcFile["filename"];
		// 重放进全局使用的filesList
		newResFilesList.push(newFile);
	});
	//合并图片
	if(resFilesList.length>0){
		Array.prototype.push.apply(resFilesList,newResFilesList);
	}else{
		resFilesList = newResFilesList;
	}
	pageOption2.FILTER_RESULT = resFilesList.slice(0);
}
function initIconFilesList(){
	var newResFilesList = [];
	$.each(printIconResFilesList, function(i, srcFile){
		var newFile = {};
		newFile["id"] = srcFile["att_id"];
		newFile["server_path"] = srcFile["server_path"];
		newFile["isCheck"] = false;
		//newFile["belongId"] = srcFile["belongId"];
		newFile["filename"] = srcFile["filename"];
		// 重放进全局使用的filesList
		newResFilesList.push(newFile);
	});
	//合并图片
	resIconFilesList = newResFilesList;
	pageOption3.FILTER_RESULT = resIconFilesList.slice(0);
}
function clearAllNode(parentNode){
    while (parentNode.firstChild) {
      var oldNode = parentNode.removeChild(parentNode.firstChild);
       oldNode = null;
     }
   }

function showFiles($cont,pageType){
	var resFilesList2 = getListByPage(pageType.PAGE,pageType.PAGE_SIZE,pageType);
	if(resFilesList2.length > 0){
		for(i=0,len = resFilesList2.length;i<len;i++){
			var obj = resFilesList2[i];
			$cont.append(createImage(obj["server_path"],obj["id"],{type:1,isCheck:obj["isCheck"],filename:obj["filename"]}));
		}
	}else{
		var tr = "";
		if(file_setting_type_list.length > 0){
			tr = "<div class=\"noFile\">资源库中没有当前类型的文件</div>";
		}else{
			tr = "<div class=\"noFile\">资源库还没有文件</div>";
		}
		$cont.append(tr);
	}

	var maxPage = totalCount % pageType.PAGE_SIZE == 0 ? totalCount / pageType.PAGE_SIZE : Math.floor(totalCount/pageType.PAGE_SIZE) + 1;
	if(maxPage == 0) { maxPage = 1; };//防止没有数据时
	if(pageType.PAGE > maxPage){ pageType.PAGE = maxPage };
	$('#current'+pageType.PAGE_BTN).html(pageType.PAGE + '/' + maxPage + '页');
	/* page button 可视性 add by shynee 2011-6-23 */
	if(maxPage == 1){
		disabledPageBtn( 'pre'+pageType.PAGE_BTN, true ,pageType);
		disabledPageBtn( 'next'+pageType.PAGE_BTN, true ,pageType);
	}else{
		if( pageType.PAGE == maxPage ){
			disabledPageBtn( 'pre'+pageType.PAGE_BTN, false,pageType );
			disabledPageBtn( 'next'+pageType.PAGE_BTN, true,pageType );
		} else if ( pageType.PAGE == 1 ) {
			disabledPageBtn( 'pre'+pageType.PAGE_BTN, true ,pageType);
			disabledPageBtn( 'next'+pageType.PAGE_BTN, false ,pageType);
		} else {
			disabledPageBtn( 'pre'+pageType.PAGE_BTN, false,pageType );
			disabledPageBtn( 'next'+pageType.PAGE_BTN, false ,pageType);
		}
	}
}
//显示资源库的文件列表
function showResFilesList(){
	clearAllNode(document.getElementById("showResFilesContent"))
	showFiles($("#showResFilesContent"),pageOption2);
}

//显示图标文件
function showIconList(){
	clearAllNode(document.getElementById("iconContent"))
	showFiles($("#iconContent"),pageOption3);
}

function bindImgHover(){
	$.each(uploadFilesList,function(){
		$("#showResFilesContent").prepend(this);
	});
}


function getListByPage(page,pageSize,pageType){
	var newAllList = new Array();
	var newList = new Array();
	newAllList = pageType.FILTER_RESULT;
	totalCount = newAllList.length;
	var maxPage = totalCount % pageSize == 0 ? totalCount / pageSize : Math.floor(totalCount/pageSize) + 1;
	page = page < 1 ? 1 : page;
	page = page > maxPage ? maxPage : page;
	var start = ((page - 1) * pageSize < 0) ? 0 : ((page - 1) * pageSize);
	var end = (start + pageSize) < 0 ? 0 : (start + pageSize);
	end = end > totalCount ? totalCount : (start + pageSize);

		for(i = start; i < end ; i++){
			newList.push(newAllList[i]);
		}
	return newList;
}

function disabledPageBtn( btnId , disabled,pageType ){
	var btn = $('#' + btnId);
	if( disabled ){
		btn.addClass('disablePageBtn');
		btn.unbind('click');
	}else{
		btn.removeClass('disablePageBtn');
		btn.unbind('click');
		if( btnId == ('pre'+pageType.PAGE_BTN )){
			btn.bind('click', function(){
				if(pageType.PAGE_BTN =='PageBtn2')
					prePage(pageType,pageOption2.FILTER_RESULT,showResFilesList);
				else
					prePage(pageType,pageOption3.FILTER_RESULT,showIconList);
				return false;
			})
		}else{
			btn.bind('click', function(){
				if(pageType.PAGE_BTN =='PageBtn2')
					nextPage(pageType,resFilesList,showResFilesList);
				else
					nextPage(pageType,resIconFilesList,showIconList);
				return false;
			})
		}
	}
}
function nextPage(pageType,list,callback){
	if(list && list.length > 0){
		var totalCount = list.length;
		var maxPage = totalCount % pageType.PAGE_SIZE == 0 ? totalCount / pageType.PAGE_SIZE : Math.floor(totalCount/pageType.PAGE_SIZE) + 1;
		if(pageType.PAGE + 1 <= maxPage){
			pageType.PAGE++;
		}
		$("#checkall").attr("checked", false);
		callback();
	}
}
function prePage(pageType,list,callback){
	if(list && list.length > 0){
		if(pageType.PAGE - 1 > 0){
			pageType.PAGE--;
		}
		$("#checkall").attr("checked", false);
		callback();
	}
}
function changeResFiles(obj){
	var id = $(obj).val();
    var data = {
        album_id : id
    };
	pageOption2.FILTER_RESULT.length=0;
    $.ajax({
        type:'post',
        url : '/mviews/album/photos',
        data: JSON.stringify(data),
        success: function(list){
            var newResFilesList = [];
            $.each(list, function(i, srcFile){
                var newFile = {};
                newFile["id"] = srcFile["att_id"];
                newFile["server_path"] = srcFile["server_path"];
                newFile["isCheck"] = false;
                //newFile["belong_id"] = srcFile["belong_id"];
                newFile["filename"] = srcFile["filename"];
                // 重放进全局使用的filesList
                newResFilesList.push(newFile);
            });
            pageOption2.FILTER_RESULT = newResFilesList.slice(0);
            $("#showResFilesContent").removeClass("ajaxLoading2")
            showResFilesList();
        }
    })
}
function filterThisKeyWord2(){
	var filterResult = [];
	$(resFilesList).each(function(i,obj){
		if((obj.filename.toLowerCase()).indexOf(pageOption2.FILTER_NAME) >= 0){
					filterResult.push(obj);
		}
	});
	pageOption2.FILTER_RESULT = filterResult;
}
function filterThisKeyWord3(){
	var filterResult = [];
	$(resIconFilesList).each(function(i,obj){
		if((obj.filename.toLowerCase()).indexOf(pageOption3.FILTER_NAME) >= 0){
					filterResult.push(obj);
		}
	});
	pageOption3.FILTER_RESULT = filterResult;
}
function searchModule(serTextObj,clearBtnObj,pageType,callback){
	//搜索绑定
	var timer = null;
	$(clearBtnObj).hide();
	$(serTextObj).focusout(function(){
		if($(this).val()==""){
			$(clearBtnObj).hide();
		}
	});
	$(serTextObj).focusin(function(){
		if($(this).val()==" 搜索文件名"){
			if($(this).hasClass("searchOutText")){
				$(this).removeClass("searchOutText");
			}
			$(this).val("");
		}
	}).focusout(function(){
		if($(this).val()==""){
			$(this).addClass("searchOutText");
			$(this).val(" 搜索文件名");
		}
	});

	//搜索
	$(serTextObj).keyup(function(){
		var _this = this;
		timer&&clearTimeout(timer);
		timer = setTimeout(function(){
			$("#checkall").attr("checked", false);
			var keyword = $(_this).val();
			pageType.FILTER_NAME = keyword.toLowerCase();
			callback();
			if($(_this).val()!=""){
				$(clearBtnObj).show();
			}
		},500);

	});

	//清除搜索
	$(clearBtnObj).bind("click",function(){
		$(serTextObj).val('');
		var keyword = $(this).val();
		pageType.FILTER_NAME = keyword.toLowerCase();
		callback();
		if(!$(serTextObj).hasClass("searchOutText")){
			$(serTextObj).addClass("searchOutText");
		}
		$(serTextObj).val(" 搜索文件名");
		$(clearBtnObj).hide();
	});

}
function initIconSearchMoudle(){
	searchModule($("#searchicon"),$("#clearsearchicon"),pageOption3,function(){
		filterThisKeyWord3();
		showIconList();
	});
}

function initSearchMoudle(){
	searchModule($("#search"),$("#clearsearch"),pageOption2,function(){
		filterThisKeyWord2();
		showResFilesList();
	});
}

function reBindChoiceFileList(){
	$("#choiceFileList li").unbind("hover");
	$("#choiceFileList li").hover(function(){
		$(this).find(".fnicon").show();
	},function(){
		$(this).find(".fnicon").hide();
	});
}
(function($){ $.getUrlParam = function(name) { var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"), r = window.location.search.substr(1).match(reg); if (r !=null) return unescape(r[2]); return null; } })(jQuery);
$(function() {
    //上传的最大图片张数
	maxPicLength = parseInt($.getUrlParam('pic_num') || maxPicLength, 10);
    // 为tab绑定事件
	$("#tabs").tabs();
	$("#sources_select").one("click", function(){
		loadSrcResFilesList();
	});
	$("#icon_select").one("click",function(){
		//loadIconList();
	});
    //加载文件夹
    $.ajax({
        type:'post',
        url : '/mviews/albums',
        success: function(list){
            var $albumId = $("#albumId"),
                $picForder = $('#picForder');
            $.each(list, function(item, obj){
                var selected = item == 0 ? 'selected="selected"' : '';
                //上传相册文件夹
                $albumId.append("<option value='"+obj.album_id+"' '"+selected+"'>"+obj.name+"</option>");
                //资源库相册文件夹
                $picForder.append("<option value='"+obj.album_id+"' '"+selected+"'>"+obj.name+"</option>");
                $picForder.bind('change', function(){
                    changeResFiles($(this));
                });
            });
            //为相册文件夹绑定事件
            $albumId.bind('change', function(){
                changeAlbumId($(this));
            });
            //初始化上传组件
            changeAlbumId($albumId);
        }
    });
    //设置选择栏可拖动
	//$("#choiceFileList").sortable({});
	$("#choiceFileList li").live("mouseover",function(){
		$(this).find(".check").show();
	});
	$("#choiceFileList li").live("mouseout",function(){
		$(this).find(".check").hide();
	});
    //为上传按钮绑定事件
    $("#submitBtn").click(function(){
        var alubmArr = [],
            pageType = $.getUrlParam("pageType"),
            valueId = $.getUrlParam('valueId'),
            callbackFn = $.getUrlParam('callbackFn'),
            items = $("#choiceFileList li");
        $.each(items,function(){
            alubmArr.push({
                src:$(this).find("img").attr("src"),
                id:$(this).attr("id"),
                filename:$(this).find(".filename").html()
            });
        });

        if(pageType =='xheditor'){
            var img = "";
            $.each(alubmArr,function(){
                img+="<img src='"+this.src.replace("_5","")+"' alt='"+this.filename+"'/>";
            });
            callback(img);
        }
        else if(pageType == 'styletool'){
            updateStyleCss(alubmArr[0].src);
        }
        else if(pageType == 'fn'){
            parent.doPicSetFn(alubmArr);
            if(typeof(parent.$.colorbox) !='undefind'){
                parent.$.colorbox.close();
            }
        }
        else{
            if(valueId){
                var val = valueId,
                    src = alubmArr[0].src,
                    src = src.substring(src.indexOf("upload"), src.length);
                parent.$("#"+val).val(src.replace("_5",''));
            }
            if(typeof(callbackFn)=='string' && callbackFn.length >0){
                var src = alubmArr[0].src,
                    src = src.substring(src.indexOf("upload"), src.length),
                    fns = callbackFn.split("."),
                    callbackFns = parent;
                for(var i = 0,len = fns.length;i<len;i++){
                    callbackFns = callbackFns[fns[i]];
                }
                callbackFns(src.replace("_5",''));
            }
            if(typeof(parent.$.colorbox) !='undefind'){
                parent.$.colorbox.close();
            }
        }
    });
    //关闭上传组件
	$("#cboxCloseBtn").click(function(){
		parent.$("#cboxClose").click();
		parent.$(".xheModalClose").click();
	});
});

