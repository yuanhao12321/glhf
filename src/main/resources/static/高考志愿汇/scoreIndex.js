/*! wanmeizhiyuan 2019-07-09 */

define(["jquery","pin","common/pinData","request"],function($,pin,pinData,Req){var recommendHis=PageData.recommendHis||[];PageData.recommendHis=[];var Tool={listOptionTpl:'<li data-value="{value}" data-text="{text}"><a href="javascript:;">{text}</a></li>',radioTpl:'<div class="ui-radio"><span class="ui-radio-value" data-value="{value}"><i class="ui-radio-state"></i></span><span class="ui-radio-label">{text}</span></div>',radioDefalutTpl:'<div class="ui-radio"><span class="ui-radio-value ui-checked" data-value="{value}"><i class="ui-radio-state"></i></span><span class="ui-radio-label">{text}</span></div>',checkboxTpl:'<div class="ui-checkbox"><span class="ui-checkbox-value" data-value="{value}"><i class="ui-checkbox-state"></i></span><span class="ui-checkbox-label">{text}</span></div>',courseTpl:'<span data-value="{value}">{text}</span>',renderTpl:function(tpl,data){return data=data||{},tpl.replace(/{(\w+)}/g,function(m,c){return data[c]})},renderDropListValue:function(option,score){option=$(option);var value=option.data("value"),inputField=option.closest(".inputField"),key=inputField.data("key");if(value==score[key]){var text=option.data("text");return inputField.data("value",value),"diploma_id"!=key&&inputField.find(".input-txt").text(text),!1}},showInputValue:function(input,score){input=$(input);var inputField=input.closest(".inputField"),key=inputField.data("key"),value=score[key];return input.val(value),inputField.data("value",value),!0},showRadioValue:function(radio,score){radio=$(radio);var key=radio.closest(".ui-radio-group").data("key");if(radio.find(".ui-radio-value").data("value")==score[key])return"wenli"==key?radio.trigger("click").find(".ui-radio-value").addClass("ui-checked"):radio.find(".ui-radio-value").addClass("ui-checked"),!1;radio.find(".ui-radio-value").removeClass("ui-checked")},showCheckboxValue:function(checkbox,score){checkbox=$(checkbox);var key=checkbox.closest(".ui-checkbox-group").data("key"),value=checkbox.find(".ui-checkbox-value").data("value"),valueList=score[key];valueList&&valueList.length&&valueList.indexOf(value)>-1?checkbox.find(".ui-checkbox-value").addClass("ui-checked"):checkbox.find(".ui-checkbox-value").removeClass("ui-checked")}},vipProvs=pin.getCfg("vipProvs"),limitConfig=pin.getCfg("limitConfig"),scoreModifyProvs=(limitConfig.provinceLock,limitConfig.scoreModifyProvs),scoreRequireProvs=limitConfig.scoreRequireProvs,diplomaRequireProvs=["11","31","32","36"],modifyLimitTimes=1,provinceConfigList=pinData.provinceConfigList,jiangsuCourseCfg=pinData.jiangsuCourseCfg,getCourse=function(courseName){return pinData.getCourse(courseName)},getXzCourseMap=function(pid){return 31==pid?pinData.shanghaiCourseMap:pinData.zhejiangCourseMap};return{updateCallback:function(){},holder:null,oldScoreInfo:null,score:null,saveScoreForm:"index",provList:[],init:function(holder,myScore,options){var scoreInfo=this.formatScore(myScore);this.score=$.extend({},scoreInfo),this.oldScoreInfo=$.extend({},scoreInfo),this.provList=this.formatProv(provinceConfigList),options.callback&&"function"==typeof options.callback&&(this.updateCallback=options.callback),this.holder=holder,this.render(),this.showScore(),this.events(),this.showRecommendHis()},showRecommendHis:function(){function recommendInfo(info,beginFrag){var runtime,spans=sheet.find("span");runtime=beginFrag?0:300,sheet.animate({top:-1*h+"px"},runtime,function(){setTimeout(function(){sheet.hide().css({top:h+"px"})},runtime/2),setTimeout(function(){spans.eq(0).text("用户"+info.nickName),spans.eq(2).text((info.scoreText||"").replace(/\s+(?!\d)/,"")),spans.eq(4).text(info.recommendSchCount+"所能上的学校"),spans.eq(5).text(info.recommendMajorCount+"个适合的专业"),spans.eq(6).text(info.recommendSchmajCount+"个适合的志愿"),sheet.show().animate({top:"0"},runtime)},runtime)})}if(!recommendHis.length)return void $(".input-his").hide();var sheet=$(".input-his-detail"),h=sheet.height(),i=0;recommendInfo(recommendHis[i++],!0),setInterval(function(){i%=recommendHis.length,recommendInfo(recommendHis[i]),i++},6e3)},render:function(){var self=this,holder=$(this.holder);holder.on("click",".ui-drop-wrap .input-txt,.ui-drop-wrap .ui-dir",function(e){var drop=$(this).closest(".ui-drop-wrap");return drop.hasClass("ui-unfold")?drop.removeClass("ui-unfold").addClass("ui-fold"):drop.hasClass("ui-fold")&&drop.removeClass("ui-fold").addClass("ui-unfold"),"diploma_id"===$(this).closest(".inputField").data("key")&&holder.find(".diploma-tip").removeClass("hidden"),!1}),holder.on("click",".ui-drop-wrap .ui-dropList-option li",function(){var inputField=$(this).closest(".inputField"),value=$(this).data("value"),text=$(this).data("text"),key=inputField.data("key");self.updateScore(key,value)&&(inputField.data("value",value),inputField.find(".input-txt").text(text),inputField.removeClass("ui-unfold").addClass("ui-fold")),"diploma_id"===key&&(holder.find(".diploma-tip").addClass("hidden"),holder.find(".js-diplama-txt").css({color:"#333"}))});var list=holder.find(".js-prov-option ol");self.provList.forEach(function(item){list.append(Tool.renderTpl(Tool.listOptionTpl,item))}),list=holder.find(".js-wenli-option");var wenliConfig=[{text:"理科",value:2},{text:"文科",value:1}];wenliConfig.forEach(function(item){list.append(Tool.renderTpl(Tool.radioTpl,item))}),list.find(".ui-radio").each(function(){return Tool.showRadioValue($(this),self.score)}),list=holder.find(".js-diploma-option"),[{text:"本科",value:7},{text:"专科",value:5}].forEach(function(item){list.append(Tool.renderTpl(Tool.radioTpl,item))}),list.find(".ui-radio").each(function(){return Tool.showRadioValue($(this),self.score)});var xzPanel=holder.find(".js-xz-Fields"),courseGroup=xzPanel.find(".js-xz-course");courseGroup.data("key","zj_opt_course");var courseMap=getXzCourseMap(self.score.prov);Object.keys(courseMap).forEach(function(key){var item={text:courseMap[key],value:key};courseGroup.append(Tool.renderTpl(Tool.checkboxTpl,item))}),courseGroup.append('<span class="tip">(请选择三项选考科目)</span>'),xzPanel.on("click",".confirm-btn",function(){xzPanel.closest(".inputField").removeClass("ui-unfold").addClass("ui-fold");var selectedCount=0,courseList=[];xzPanel.find(".ui-checkbox-group").each(function(){$(this).find(".ui-checkbox").each(function(){var valueBox=$(this).find(".ui-checkbox-value");valueBox.hasClass("ui-checked")&&(selectedCount++,courseList.push(valueBox.data("value")))})});var key=xzPanel.find(".ui-checkbox-group").data("key");if(3!=selectedCount)self.showMsg("请选择三项选考科目"),self.showScoreXzPanel();else{if(self.updateScore(key,courseList)){var text="",courseMap=getXzCourseMap(self.score.prov);courseList.forEach(function(item){text.length>0?text+="/"+courseMap[item]:text+=courseMap[item]}),xzPanel.find(".input-txt").text(text)}}}),holder.on("click",".ui-checkbox",function(e){var valueBox=$(this).find(".ui-checkbox-value"),selectedCount=0;$(this).siblings(".ui-checkbox").each(function(){$(this).find(".ui-checkbox-value").hasClass("ui-checked")&&selectedCount++}),valueBox.hasClass("ui-checked")?(valueBox.removeClass("ui-checked"),selectedCount--):selectedCount<3&&(valueBox.addClass("ui-checked"),selectedCount++);var groupBox=$(this).closest(".ui-checkbox-group");selectedCount>=3?$(this).siblings(".ui-checkbox").each(function(index,item){$(this).find(".ui-checkbox-value").hasClass("ui-checked")||$(this).css("opacity","0.5")}):groupBox.children().css("opacity","1")});var jiangsuPanel=holder.find(".js-jiangsu-Fields");holder.on("click",".ui-radio",function(e){var valueBox=$(this).find(".ui-radio-value");if(valueBox.hasClass("ui-checked"))return!1;valueBox.addClass("ui-checked");var groupBox=$(this).closest(".ui-radio-group");groupBox.length&&$(this).siblings(".ui-radio").find(".ui-radio-value").removeClass("ui-checked");var value=valueBox.data("value"),key=groupBox.data("key");self.updateScore(key,value),"opt_course"==key&&holder.find(".js-jiangsu-Fields").find(".js-jiangsu-optLevel .ui-radio").eq(0).trigger("click")}),jiangsuPanel.on("click",".confirm-btn",function(){jiangsuPanel.closest(".inputField").removeClass("ui-unfold").addClass("ui-fold")});var wenliRadioGroup=jiangsuPanel.find(".js-jiangsu-wenli");wenliRadioGroup.data("key","wenli"),wenliConfig.forEach(function(item){wenliRadioGroup.append(Tool.renderTpl(Tool.radioTpl,item))});var reqCourse=jiangsuPanel.find(".js-jiangsu-reqCourse"),reqCourseConfig=jiangsuCourseCfg.req_course;reqCourse.data("key","req_course"),[reqCourseConfig.li,reqCourseConfig.wen].forEach(function(item){reqCourse.append(Tool.renderTpl(Tool.courseTpl,item))});var reqLevelRadioGroup=jiangsuPanel.find(".js-jiangsu-reqLevel"),reqLevelConfig=jiangsuCourseCfg.courseLevels;reqLevelRadioGroup.data("key","req_level"),reqLevelConfig.forEach(function(v){reqLevelRadioGroup.append(Tool.renderTpl(Tool.radioTpl,{text:v,value:v}))});var optCourseRadioGroup=jiangsuPanel.find(".js-jiangsu-optCourse"),optCourseConfig=jiangsuCourseCfg.opt_courseList;optCourseRadioGroup.data("key","opt_course"),optCourseConfig.forEach(function(item){optCourseRadioGroup.append(Tool.renderTpl(Tool.radioTpl,item))});var optLevelRadioGroup=jiangsuPanel.find(".js-jiangsu-optLevel"),optLevelConfig=jiangsuCourseCfg.courseLevels;optLevelRadioGroup.data("key","opt_level"),optLevelConfig.forEach(function(v){optLevelRadioGroup.append(Tool.renderTpl(Tool.radioTpl,{text:v,value:v}))})},showScore:function(){var self=this,holder=$(this.holder);holder.find(".inputField .ui-dropList-option").each(function(){$(this).find("li").each(function(){return Tool.renderDropListValue(this,self.score)})}),holder.find(".inputField input").each(function(){return Tool.showInputValue(this,self.score)}),self.showScoreByProv(),holder.removeClass("hidden")},showScoreByProv:function(){var self=this,holder=self.holder;if(holder.on("focus","input.realScore",function(){scoreModifyProvs.indexOf(self.score.prov.toString())>-1&&holder.find(".input-score-tip").removeClass("hidden")}),holder.on("blur","input.realScore",function(){holder.find(".input-score-tip").addClass("hidden")}),self.diplomaRequire()){holder.find(".js-diploma-option").find("li").each(function(){return Tool.renderDropListValue(this,self.score)}),holder.find(".js-diploma-option").closest(".ui-radio-group").removeClass("hidden"),self.updateScore("diploma_id",7);var provName=this.getProvName(self.score.prov),text=provName+"本科和专科高考成绩不一致，选择成绩对应的批次";holder.find(".diploma-tip").text(text),holder.find(".js-diplama-txt").css({color:"#ccc"})}else self.score.diploma_id="",holder.find(".js-diploma-option").closest(".ui-radio-group").addClass("hidden"),holder.find(".diploma-tip").addClass("hidden");self.rankRequire()?(holder.find(".rank-fields .input-require").addClass("active"),holder.find(".require-rank .realScore").attr("placeholder","高考分数"),holder.find(".require-rank .inputScoreRank").attr("placeholder","高考排名"),$("#scoreInputWrap  .warnging").removeClass("hidden"),$("#scoreInputWrap  .commom").addClass("hidden"),holder.find(".require-rank .input-label").eq(0).text("高考总分"),holder.find(".require-rank .input-label").eq(1).text("全省排名")):(holder.find(".rank-fields .input-require").removeClass("active"),$("#scoreInputWrap .warnging").addClass("hidden"),$("#scoreInputWrap .commom").removeClass("hidden")),"32"==self.score.prov?(self.showScoreJiangsuPanel(),self.updateScore("diploma_id",7),$("div[data-key='diploma_id']").addClass("hidden"),$("div[data-key='inputScoreRank']").addClass("hidden"),holder.find(".course-select-panel").closest(".inputField").addClass("hidden"),holder.find(".course-level-panel").closest(".inputField").removeClass("hidden")):"31"==self.score.prov||"33"==self.score.prov?(self.showScoreXzPanel(),holder.find(".js-wenli-option").closest(".inputField").addClass("hidden"),holder.find(".course-select-panel").closest(".inputField").removeClass("hidden"),holder.find(".course-level-panel").closest(".inputField").addClass("hidden")):(holder.find(".js-wenli-option").closest(".inputField").removeClass("hidden"),holder.find(".course-select-panel").closest(".inputField").addClass("hidden"),holder.find(".course-level-panel").closest(".inputField").addClass("hidden"),$("div[data-key='inputScoreRank']").removeClass("hidden"))},showScoreXzPanel:function(){var self=this;$(this.holder).find(".js-xz-Fields").find(".ui-checkbox-group").each(function(){$(this).find(".ui-checkbox").each(function(){return Tool.showCheckboxValue(this,self.score)})})},showScoreJiangsuPanel:function(){var self=this;self.showJiangsuCourse(),self.showJiangsuCourseLevel(),self.showJiangsuFieldText()},showJiangsuCourse:function(){var self=this,holder=$(this.holder),jiangsuPanel=holder.find(".js-jiangsu-Fields"),wenli=this.score.wenli;jiangsuPanel.find(".js-jiangsu-reqCourse span").each(function(){var course=$(this).data("value");"physics"==course&&2==wenli||"history"==course&&1==wenli?($(this).removeClass("hidden"),self.score.req_course=course):$(this).addClass("hidden")})},showJiangsuCourseLevel:function(){var self=this;$(this.holder).find(".js-jiangsu-Fields").find(".ui-radio-group").each(function(){$(this).find(".ui-radio").each(function(){return Tool.showRadioValue(this,self.score)})})},showJiangsuFieldText:function(){var req_courseCfg=getCourse(this.score.req_course),opt_courseCfg=getCourse(this.score.opt_course),text=1==this.score.wenli?"文科":"理科";text+="/"+req_courseCfg.text.slice(0,1)+this.score.req_level,text+="/"+opt_courseCfg.text.slice(0,1)+this.score.opt_level,this.holder.find(".js-jiangsu-Fields .input-txt").text(text)},switchJiangsuWenli:function(){var self=this,holder=$(this.holder);holder.find(".js-jiangsu-Fields");self.showJiangsuCourse(),self.showJiangsuFieldText(),$(".js-wenli-option").find("li").each(function(){var value=self.score.wenli;if(value==$(this).data("value")){var text=$(this).data("text"),inputField=$(this).closest(".inputField");return inputField.data("value",value),inputField.find(".input-txt").text(text),!1}})},events:function(){var self=this,holder=$(this.holder);holder.find(".js-jiangsu-Fields").on("click",".js-jiangsu-optCourse .ui-radio",function(){var radio=$(this),index=radio.index();radio.closest(".course-option").find(".dir-border").css("left",30+radio.width()*index+"px")}),holder.find(".inputField input").on("input",function(){var key=$(this).closest(".inputField").data("key"),value=$(this).val();value=parseInt(value)||"",$(this).val(value),self.updateScore(key,value)}),$(".submit-btn").on("click",function(){self.submit()}),$(document.body).on("click",function(e){var target=$(e.target),dropWrap=target.closest(".ui-drop-wrap");holder.find(".ui-unfold").not(dropWrap).removeClass("ui-unfold").addClass("ui-fold")})},formatProv:function(provinceConfigList){var provList=[];return provinceConfigList.forEach(function(p){provList.push({text:p.py+"  "+p.prov,value:p.pid})}),provList},getProvName:function(prov){for(var provName,provList=this.provList,i=0;i<provList.length;i++)if(provList[i].value==prov){provName=provList[i].text.replace(/[\w\s]/g,"");break}return provName},vipProvVerify:function(pid){if("31"==pid||"33"==pid)return window.zhejiangTipPopup(function(){}),!1;if(vipProvs.length>0&&-1==vipProvs.indexOf(pid+"")){if(1==vipProvs.length){var provNameOfCard=this.getProvName(vipProvs[0]);alert('您的VIP权限仅限于<span style="color:red">'+provNameOfCard+"</span>使用，请及时切换回有效省份，否则VIP权限将失效。")}else if(vipProvs.length>1){var curProName=this.getProvName(pid);alert('您的VIP权限不能在<span style="color:red">'+curProName+"</span>使用，请及时切换回有效省份，否则VIP权限将失效。")}return!0}return!0},formatScore:function(myScore){var req_courseCfg;return req_courseCfg=myScore.req_course?getCourse(myScore.req_course):jiangsuCourseCfg.req_course[1==myScore.wenli?"wen":"li"],myScore.diploma_id=1*myScore.diploma_id||7,myScore.score=myScore.score>=0?myScore.score:"",myScore.realScore=myScore.realScore>0?myScore.realScore:"",myScore.scoreRank=myScore.scoreRank>0?myScore.scoreRank:"",myScore.inputScoreRank=myScore.inputScoreRank>0?myScore.inputScoreRank:"",myScore.req_courseCfg=req_courseCfg,myScore.req_course=req_courseCfg.value,myScore.opt_course=myScore.opt_course||jiangsuCourseCfg.opt_courseList[0].value,myScore.req_level=myScore.req_level||jiangsuCourseCfg.courseLevels[0],myScore.opt_level=myScore.opt_level||jiangsuCourseCfg.courseLevels[0],myScore.update_count=Math.max(myScore.update_count>>0,0),myScore.opt_courseCfg={biology:"生物",chemistry:"化学",geography:"地理",politics:"政治"},myScore},updateScore:function(key,value){var oldValue=this.score[key];if(this.score[key]=value,"prov"==key){if(!this.vipProvVerify(value))return this.score[key]=oldValue,!1;this.showScoreByProv()}else"inputScoreRank"==key&&(this.score.inputScoreRank==this.oldScoreInfo.inputScoreRank?this.score.scoreRank=this.oldScoreInfo.scoreRank:this.score.scoreRank=this.score.inputScoreRank);return"32"==this.score.prov&&("wenli"==key&&this.switchJiangsuWenli(),["req_course","req_level","opt_course","opt_level","wenli"].indexOf(key)>-1&&this.showJiangsuFieldText()),this.score},scoreKeys:function(myScore){var paramKeys=["prov","realScore","scoreRank","score","wenli","diploma_id"];return"32"==myScore.prov?paramKeys=paramKeys.concat(["req_course","opt_course","req_level","opt_level"]):"31"!=myScore.prov&&"33"!=myScore.prov||(paramKeys=paramKeys.concat(["zj_opt_course"])),paramKeys},scoreHasChange:function(myScore){var paramKeys=this.scoreKeys(myScore),change=!1;for(var key in myScore)if(paramKeys.indexOf(key)>-1&&this.oldScoreInfo[key]!=myScore[key]){change=!0;break}return change},validScore:function(myScore){var self=this,provid=myScore.prov,msg="";return"31"==myScore.prov||"33"==myScore.prov?(window.zhejiangTipPopup(function(){}),!1):(myScore.scoreRank>999999?msg="您输入的排名异常":myScore.realScore<=0?msg="请输入您的高考分数":self.rankRequire(myScore)&&myScore.inputScoreRank<=0?msg="请输入您的高考排名":31!=provid&&33!=provid||myScore.zj_opt_course&&!(myScore.zj_opt_course.length<3)?46==provid&&myScore.realScore>940?msg="您输入的成绩已超过满分":31==provid&&myScore.realScore>660?msg="您输入的成绩已超过满分":32==provid&&myScore.realScore>480?msg="您输入的成绩已超过满分":-1==$.inArray(1*provid,[31,32,46])&&myScore.realScore>750?msg="您输入的成绩已超过满分":self.diplomaRequire()&&!myScore.diploma_id&&(msg="请选择所在批次"):msg="请输入您的选考科目",!msg||(self.showMsg(msg),!1))},scoreConfirm:function(myScore){var provName=this.getProvName(myScore.prov),content='<p>成绩已公布，成绩只能修改一次，请确保输入的成绩无误</p><div class="wideContent"><p><span class="label">省份文理</span>'+provName+" | "+(1==myScore.wenli?"文科":"理科")+"</p>";if(32==myScore.prov){var xuance=(myScore.wenli="物理")+myScore.req_level;xuance+=" | "+myScore.opt_courseCfg[myScore.opt_course]+myScore.opt_level,xuance='<p><span class="label">选测科目</span>'+xuance+"</p>",content+=xuance}content+='<p><span class="label">高考分数</span>'+myScore.realScore+" 分</p>",this.rankRequire(myScore)&&(content+='<p><span class="label">全省排名</span>'+myScore.scoreRank+" 名</p>"),content+="</div>";var update_count_txt,update_count=this.oldScoreInfo.update_count-1;update_count_txt=update_count>0?"只能再修改"+update_count+"次":"成绩将被锁定，不可再修改";var actTip='<div class="wideContent-act-tip"><div class="ui-checkbox"><span class="ui-checkbox-value" data-value="1"><i class="ui-checkbox-state"></i></span></div>点击 “确定” 后，<span class="strong">'+update_count_txt+"</span></div>",self=this;pin.use("richAlert",{extension:"wideContent",alertType:"warn",title:"成绩确认后将无法再修改",content:content+actTip,towBtns:!0,okTxt:"确认无误",okCallback:function(){if(!this.jq().find(".wideContent-act-tip .ui-checkbox-value").hasClass("ui-checked"))return!1;self.doSaveFn()},cancelTxt:"返回修改",cancelCallback:function(){},uiEvent:function(){var $button=this.jq(".act a").eq(1);this.jq(".title span").css({color:"#f74c53"}),this.jq().find(".wideContent-act-tip").on("click",".ui-checkbox-value",function(){$(this).hasClass("ui-checked")?($(this).removeClass("ui-checked"),$button.attr("disabled",!0)):($(this).addClass("ui-checked"),$button.attr("disabled",!1))}),$button.attr("disabled",!0)}}).display(1)},submit:function(){var self=this,myScore=self.score;if(!this.scoreHasChange(myScore)&&myScore.realScore>0)return this.updateCallback(myScore),!0;if(this.isLocked(myScore))return this.showMsg("你已编辑过"+modifyLimitTimes+"次，成绩已锁定"),!1;if(!this.validScore(myScore))return!1;var provName=this.getProvName(self.score.prov),actTip='<div class="wideContent-act-tip" style="margin-top: -15px;">当前选择的省份为：<span class="strong">'+provName+"</span></div>";return pin.use("richAlert",{extension:"wideContent",alertType:"warn",title:"省份选择后不可再修改",content:actTip,towBtns:!0,okTxt:"确定",okCallback:function(){self.confirmSave()},cancelTxt:"返回修改",cancelCallback:function(){},uiEvent:function(){this.jq(".act .btn:last").css({background:"#00AFF0",color:"white","border-color":"#00AFF0"})}}).display(1),!1},modifyLimit:function(){return scoreModifyProvs.indexOf((this.score||this.oldScoreInfo).prov+"")>-1&&this.oldScoreInfo.update_count<=modifyLimitTimes},allowModify:function(){return!this.modifyLimit()||this.oldScoreInfo.update_count>0},rankRequire:function(myScore){return myScore=myScore||this.score,scoreRequireProvs.indexOf(myScore.prov+"")>-1},diplomaRequire:function(myScore){return myScore=myScore||this.score,diplomaRequireProvs.indexOf(myScore.prov+"")>-1},isLocked:function(myScore){var self=this;if(myScore=myScore||this.score,!this.allowModify()&&this.scoreHasChange(myScore)){for(var paramKeys=this.scoreKeys(myScore),i=0;i<paramKeys.length;i++)self.score[paramKeys[i]]=this.oldScoreInfo[paramKeys[i]];return self.score.inputScoreRank=this.oldScoreInfo.inputScoreRank,!0}return!1},makeSure:function(myScore){var update_count_txt,that=this,update_count=this.oldScoreInfo.update_count-1;update_count_txt=update_count>0?"你当前只能再修改"+update_count+"次修改成绩":"成绩将被锁定，不可再修改";var actTip='<div class="waringContent">您所在省份已经公布高考成绩，为保证推荐准确性，<span class="warning">'+update_count_txt+"</span>，请确保输入成绩无误。</div>";pin.use("richAlert",{extension:"wideContent",alertType:"warn",title:"成绩修改后将被锁定",content:actTip,towBtns:!1,okTxt:"我知道了",okCallback:function(){that.scoreConfirm(myScore)},uiEvent:function(){var self=this;self.jq(".act").css({width:"170px",margin:"30px auto 0px",display:"block"}),self.jq(".title span").css({color:"#f74c53"})}}).display(1)},confirmSave:function(){var myScore=this.score;this.modifyLimit()?this.makeSure(myScore):this.doSaveFn()},doSaveFn:function(){for(var self=this,scoreParams=$.extend({},self.score),params={},paramKeys=this.scoreKeys(scoreParams),i=0;i<paramKeys.length;i++)params[paramKeys[i]]=scoreParams[paramKeys[i]];params.score_form=this.saveScoreForm,console.log(params),Req.score(params,function(res){var data=res.data;if(0!=data.code)alert(data.msg);else{var newScoreInfo=data.data.myScore;self.oldScoreInfo.update_count=Math.max(0,self.oldScoreInfo.update_count-1),self.oldScoreInfo=scoreParams=newScoreInfo,self.updateCallback(scoreParams)}})},showMsg:function(title,content,callback){pin.use("richAlert",{alertType:"warn",title:title,content:content||""}).display(1)}}});
//# sourceMappingURL=scoreIndex.js.map