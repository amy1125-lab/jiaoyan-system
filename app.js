//====================全局存储KEY定义====================
const DB_KEY = {
    user: "sys_user_list",
    plan: "sys_plan_list",
    task: "sys_task_list",
    anno: "sys_anno_list",
    research: "sys_research_list",
    listen: "sys_listen_list",
    course: "sys_course_list",
    template: "sys_template_list",
    tool: "sys_tool_list",
    ref: "sys_ref_list",
    reflection: "sys_reflection_list"
};
let nowUser = null;
let selectSourceArr = [];

//====================本地存储封装====================
function getStorage(key) {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}
function setStorage(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

//初始化管理员账号 admin/123456
(function initAdmin() {
    let userArr = getStorage(DB_KEY.user);
    if (userArr.length === 0) {
        userArr.push({ account: "admin", pwd: "123456", name: "研学导师" });
        setStorage(DB_KEY.user, userArr);
    }
})();

//====================通用下载CSV公共方法====================
function downloadFile(content, fileName) {
    let blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    let a = document.createElement("a");
    a.href = URL.createObject(blob);
    a.download = fileName;
    a.click();
}

//====================登录注册相关====================
//密码显隐切换
function togglePwd(id) {
    let input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}
//页面切换
function goReg() {
    document.getElementById("login").style.display = "none";
    document.getElementById("reg").style.display = "block";
    document.getElementById("reset").style.display = "none";
}
function goLogin() {
    document.getElementById("login").style.display = "block";
    document.getElementById("reg").style.display = "none";
    document.getElementById("reset").style.display = "none";
}
function goReset() {
    document.getElementById("login").style.display = "none";
    document.getElementById("reg").style.display = "none";
    document.getElementById("reset").style.display = "block";
}
//登录
function login() {
    let acc = document.getElementById("login_user").value.trim();
    let pwd = document.getElementById("login_pwd").value.trim();
    let userList = getStorage(DB_KEY.user);
    let user = userList.find(item => item.account === acc && item.pwd === pwd);
    if (!user) return alert("账号或密码错误！");
    nowUser = user;
    document.getElementById("login").style.display = "none";
    document.getElementById("sysMain").style.display = "block";
    document.getElementById("topUserName").innerHTML = `登录用户：${user.name} <span class="role-tag">普通授课权限</span>`;
    initAllSelectOpt();
    renderAllTable();
}
//注册账号
function register() {
    let acc = document.getElementById("reg_user").value.trim();
    let pwd = document.getElementById("reg_pwd").value.trim();
    if (!acc || pwd.length < 6) return alert("账号不可为空，密码最少6位！");
    let list = getStorage(DB_KEY.user);
    if (list.some(s => s.account === acc)) return alert("该账号已被注册！");
    list.push({ account: acc, pwd: pwd, name: acc });
    setStorage(DB_KEY.user, list);
    alert("注册成功，请登录！");
    goLogin();
}
//重置密码
function resetPwd() {
    let acc = document.getElementById("reset_user").value.trim();
    let newPwd = document.getElementById("reset_new_pwd").value.trim();
    let confirmPwd = document.getElementById("reset_confirm_pwd").value.trim();
    if (newPwd !== confirmPwd) return alert("两次输入密码不一致！");
    let list = getStorage(DB_KEY.user);
    let obj = list.find(s => s.account === acc);
    if (!obj) return alert("账号不存在！");
    obj.pwd = newPwd;
    setStorage(DB_KEY.user, list);
    alert("密码重置完成！");
    goLogin();
}
//退出登录
function logout() {
    nowUser = null;
    document.getElementById("sysMain").style.display = "none";
    goLogin();
}

//====================侧边菜单====================
function toggleMenu(id) {
    let dom = document.getElementById(id);
    dom.style.display = dom.style.display === "none" ? "block" : "none";
}
function switchModule(id) {
    document.querySelectorAll(".content-panel").forEach(el => el.style.display = "none");
    document.getElementById(id).style.display = "block";
}

//====================下拉框初始化(课程联动：听评课、教学反思)====================
function initAllSelectOpt() {
    let courseList = getStorage(DB_KEY.course);
    let optHtml = `<option value="all">全部课程</option>`;
    courseList.forEach(item => optHtml += `<option value="${item.id}">${item.courseName}</option>`);
    let refSel = document.getElementById("refFilterCourse");
    let listenSel = document.getElementById("listenCourseFilter");
    let listenAddSel = document.getElementById("listenCourse");
    if(refSel) refSel.innerHTML = optHtml;
    if(listenSel) listenSel.innerHTML = optHtml;
    if(listenAddSel) listenAddSel.innerHTML = optHtml;
}

//全页面表格统一渲染入口
function renderAllTable() {
    renderPlan();
    renderTask();
    renderAnno();
    renderResearch();
    renderListen();
    renderCourse();
    renderTemplate();
    renderTool();
    renderRef();
    renderReflection();
}

//====================1、教学计划模块====================
function addPlanFromCalendar() {
    document.getElementById("planName").value = "";
    document.getElementById("planStart").value = "";
    document.getElementById("planEnd").value = "";
    document.getElementById("planContent").value = "";
}
function savePlan() {
    let name = document.getElementById("planName").value.trim();
    let s = document.getElementById("planStart").value;
    let e = document.getElementById("planEnd").value;
    let cont = document.getElementById("planContent").value.trim();
    if (!name || !s || !e) return alert("计划名称、起止时间必填！");
    let arr = getStorage(DB_KEY.plan);
    arr.push({ id: Date.now(), planName: name, start: s, end: e, content: cont, check: false });
    setStorage(DB_KEY.plan, arr);
    renderPlan();
    addPlanFromCalendar();
}
function renderPlan() {
    let arr = getStorage(DB_KEY.plan);
    let html = "";
    arr.forEach(item => {
        html += `<tr>
            <td><input type="checkbox" ${item.check ? "checked" : ""} data-id="${item.id}" onclick="checkPlan(${item.id})"></td>
            <td>${item.planName}</td>
            <td>${item.start} ~ ${item.end}</td>
            <td>正常</td><td>-</td>
        </tr>`;
    });
    document.getElementById("planTableBody").innerHTML = html;
}
function checkPlan(id) {
    let arr = getStorage(DB_KEY.plan);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.plan, arr);
}
function deleteSelectedPlan() {
    let arr = getStorage(DB_KEY.plan).filter(s => !s.check);
    setStorage(DB_KEY.plan, arr);
    renderPlan();
}
function exportPlanTable() {
    let arr = getStorage(DB_KEY.plan);
    let csv = "计划名称,开始时间,结束时间,计划内容\n";
    arr.forEach(i => csv += `${i.planName},${i.start},${i.end},"${i.content}"\n`);
    downloadFile(csv, "教学计划.csv");
}

//====================2、任务分派模块====================
function changeAssignType() {
    let val = document.getElementById("assignType").value;
    document.getElementById("singleUserRow").style.display = val === "single" ? "flex" : "none";
    document.getElementById("multiUserRow").style.display = val === "multi" ? "flex" : "none";
}
function newTask() {
    document.getElementById("taskContent").value = "";
    document.getElementById("taskStart").value = "";
    document.getElementById("taskDeadline").value = "";
}
function submitTask() {
    let cont = document.getElementById("taskContent").value.trim();
    let s = document.getElementById("taskStart").value;
    let d = document.getElementById("taskDeadline").value;
    if (!cont || !s || !d) return alert("任务内容、起止时间不能为空！");
    let arr = getStorage(DB_KEY.task);
    arr.push({ id: Date.now(), content: cont, start: s, deadline: d, user: nowUser.name, check: false });
    setStorage(DB_KEY.task, arr);
    renderTask();
    newTask();
}
function renderTask() {
    let arr = getStorage(DB_KEY.task);
    let h = "";
    arr.forEach(i => {
        h += `<tr>
        <td><input type="checkbox" ${i.check?"checked":""} onclick="checkTask(${i.id})"></td>
        <td>${i.content}</td><td>${i.start}</td><td>${i.deadline}</td>
        <td>${i.user}</td><td>无附件</td><td>进行中</td>
        </tr>`;
    });
    document.getElementById("taskTableBody").innerHTML = h;
}
function checkTask(id) {
    let arr = getStorage(DB_KEY.task);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.task, arr);
}
function deleteSelectedTask() {
    let arr = getStorage(DB_KEY.task).filter(s => !s.check);
    setStorage(DB_KEY.task, arr);
    renderTask();
}
function exportTaskTable() {
    let arr = getStorage(DB_KEY.task);
    let csv = "任务内容,开始时间,截止时间,负责人\n";
    arr.forEach(i => csv += `${i.content},${i.start},${i.deadline},${i.user}\n`);
    downloadFile(csv, "任务清单.csv");
}

//====================3、部门公告====================
function newAnnouncement() {
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";
}
function publishingAnnouncement() {
    let t = document.getElementById("announcementTitle").value.trim();
    let c = document.getElementById("announcementContent").value.trim();
    if (!t || !c) return alert("公告标题与正文不能为空！");
    let arr = getStorage(DB_KEY.anno);
    arr.push({ id: Date.now(), title: t, content: c, time: new Date().toLocaleString(), check: false });
    setStorage(DB_KEY.anno, arr);
    renderAnno();
    newAnnouncement();
}
function renderAnno() {
    let arr = getStorage(DB_KEY.anno);
    let h = "";
    arr.forEach(i => {
        h += `<tr>
        <td><input type="checkbox" ${i.check?"checked":""} onclick="checkAnno(${i.id})"></td>
        <td>${i.title}</td><td>${i.time}</td><td>未阅读</td><td></td>
        </tr>`;
    });
    document.getElementById("announcementTableBody").innerHTML = h;
}
function checkAnno(id) {
    let arr = getStorage(DB_KEY.anno);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.anno, arr);
}
function deleteSelectedAnnouncement() {
    let arr = getStorage(DB_KEY.anno).filter(s => !s.check);
    setStorage(DB_KEY.anno, arr);
    renderAnno();
}
function exportAnnouncementTable() {
    let arr = getStorage(DB_KEY.anno);
    let csv = "公告标题,发布时间,公告内容\n";
    arr.forEach(i => csv += `${i.title},${i.time},"${i.content}"\n`);
    downloadFile(csv, "部门公告.csv");
}

//====================4、教研活动====================
function openAddResearch() {
    document.getElementById("resTitle").value = "";
    document.getElementById("resCate").value = "校内教研";
    document.getElementById("resTime").value = "";
    document.getElementById("editResId").value = "";
}
function saveResearch() {
    let title = document.getElementById("resTitle").value.trim();
    let cate = document.getElementById("resCate").value;
    let rtime = document.getElementById("resTime").value;
    let eid = document.getElementById("editResId").value;
    if (!title || !rtime) return alert("主题、活动日期必填！");
    let arr = getStorage(DB_KEY.research);
    if(eid){
        let item = arr.find(x=>x.id==eid);
        item.title=title;item.cate=cate;item.time=rtime;
    }else{
        arr.push({id:Date.now(),title,cate,time:rtime,user:nowUser.name,fileList:[],check:false});
    }
    setStorage(DB_KEY.research,arr);
    renderResearch();openAddResearch();
}
function renderResearch(filter=null){
    let list=filter||getStorage(DB_KEY.research);
    let html="";
    list.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkRes(${i.id})"></td>
        <td>${i.title}</td><td>${i.cate}</td><td>${i.time}</td><td>${i.user}</td>
        <td>${i.fileList.length>0?'<button class="blue-btn small">附件</button>':'无'}</td>
        <td><button onclick="openPreviewRes(${i.id})" class="gray-btn small">查看</button></td></tr>`;
    });
    document.getElementById("researchTableBody").innerHTML=html;
}
function checkRes(id){
    let arr=getStorage(DB_KEY.research);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.research,arr);renderResearch();
}
function batchDelResearch(){
    let arr=getStorage(DB_KEY.research).filter(x=>!x.check);setStorage(DB_KEY.research,arr);renderResearch();
}
function filterResearch(){
    let c=document.getElementById("resCateFilter").value;
    let d=document.getElementById("resDateFilter").value;
    let all=getStorage(DB_KEY.research);
    let res=all.filter(x=>{
        let f1=(c=="all"||x.cate==c);
        let f2=(!d||x.time==d);
        return f1&&f2;
    });
    renderResearch(res);
}
function resetFilterResearch(){
    document.getElementById("resCateFilter").value="all";document.getElementById("resDateFilter").value="";renderResearch();
}
function openPreviewRes(id){
    let arr=getStorage(DB_KEY.research);
    let o=arr.find(x=>x.id==id);
    document.getElementById("resPreviewBox").innerText=`主题：${o.title}\n分类：${o.cate}\n日期：${o.time}\n录入人：${o.user}`;
    document.getElementById("resPreviewModal").style.display="flex";
}
function closeResPreviewModal(){document.getElementById("resPreviewModal").style.display="none";}
function batchDownResearch(){alert("批量下载附件模拟触发");}
function closeResUploadModal(){document.getElementById("resUploadModal").style.display="none";}
function saveResFile(){alert("教研附件上传成功");closeResUploadModal();renderResearch();}

//====================5、听评课====================
function openAddListen(){
    document.getElementById("listenUser").value=nowUser.name;
    document.getElementById("listenCourse").value="";
    document.getElementById("listenScore").value="";
    document.getElementById("listenRemark").value="";
    document.getElementById("editListenId").value="";
}
function saveListenRecord(){
    let user=document.getElementById("listenUser").value.trim();
    let course=document.getElementById("listenCourse").value;
    let score=document.getElementById("listenScore").value;
    let remark=document.getElementById("listenRemark").value.trim();
    let eid=document.getElementById("editListenId").value;
    if(!user||!course) return alert("听课人、授课课程必填！");
    let arr=getStorage(DB_KEY.listen);
    if(eid){
        let o=arr.find(x=>x.id==eid);
        o.user=user;o.course=course;o.score=score;o.remark=remark;
    }else{
        arr.push({id:Date.now(),user,course,score,remark,time:new Date().toLocaleDateString(),check:false});
    }
    setStorage(DB_KEY.listen,arr);
    renderListen();openAddListen();
}
function renderListen(filter=null){
    let list=filter||getStorage(DB_KEY.listen);
    let html="";
    list.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkListen(${i.id})"></td>
        <td>${i.user}</td><td>${i.course}</td><td>${i.time}</td><td>${i.score||'无'}</td>
        <td>无附件</td><td><button onclick="openListenDetail(${i.id})" class="gray-btn small">查看</button></td></tr>`;
    });
    document.getElementById("listenTableBody").innerHTML=html;
}
function checkListen(id){
    let arr=getStorage(DB_KEY.listen);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.listen,arr);renderListen();
}
function batchDelListen(){
    let arr=getStorage(DB_KEY.listen).filter(x=>!x.check);setStorage(DB_KEY.listen,arr);renderListen();
}
function filterListen(){
    let c=document.getElementById("listenCourseFilter").value;
    let d=document.getElementById("listenDateFilter").value;
    let all=getStorage(DB_KEY.listen);
    let res=all.filter(x=>{
        let f1=(c=="all"||x.course==c);
        let f2=(!d||x.time==d);
        return f1&&f2;
    });
    renderListen(res);
}
function resetFilterListen(){
    document.getElementById("listenCourseFilter").value="all";document.getElementById("listenDateFilter").value="";renderListen();
}
function openListenDetail(id){
    let arr=getStorage(DB_KEY.listen);
    let o=arr.find(x=>x.id==id);
    document.getElementById("listenDetailBox").innerText=`听课人：${o.user}\n课程：${o.course}\n日期：${o.time}\n评分：${o.score||'无'}\n备注：${o.remark||'无'}`;
    document.getElementById("listenDetailModal").style.display="flex";
}
function closeListenDetailModal(){document.getElementById("listenDetailModal").style.display="none";}
function exportListenExcel(){
    let arr=getStorage(DB_KEY.listen);
    let csv="听课人,课程,日期,评分,备注\n";
    arr.forEach(i=>csv+=`${i.user},${i.course},${i.time},${i.score||'无'},"${i.remark||'无'}"\n`);
    downloadFile(csv,"听课记录.csv");
}
function closeListenUploadModal(){document.getElementById("listenUploadModal").style.display="none";}
function saveListenUpload(){alert("附件上传成功");closeListenUploadModal();renderListen();}

//====================6、课程资源库====================
function openCourseModal(){
    document.getElementById("courseLine").value="研学实践";
    document.getElementById("courseName").value="";
    document.getElementById("courseOwner").value="";
    document.getElementById("courseAge").value="";
    document.getElementById("courseDuration").value="";
}
function submitCourse(){
    let line=document.getElementById("courseLine").value;
    let name=document.getElementById("courseName").value.trim();
    let owner=document.getElementById("courseOwner").value.trim();
    let age=document.getElementById("courseAge").value;
    let duration=document.getElementById("courseDuration").value;
    if(!name||!owner) return alert("课程名称、主讲人必填！");
    let arr=getStorage(DB_KEY.course);
    arr.push({id:Date.now(),line,name,owner,age,duration,check:false});
    setStorage(DB_KEY.course,arr);
    renderCourse();closeCourseModal();
}
function renderCourse(){
    let arr=getStorage(DB_KEY.course);
    let html="";
    arr.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkCourse(${i.id})"></td>
        <td>${i.line}</td><td>${i.name}</td><td>${i.owner}</td><td>${i.age||'无'}</td><td>${i.duration||'无'}</td>
        <td>-</td><td>-</td><td>-</td><td>-</td><td><button onclick="editCourse(${i.id})" class="blue-btn small">编辑</button></td></tr>`;
    });
    document.getElementById("courseTableBody").innerHTML=html;
}
function checkCourse(id){
    let arr=getStorage(DB_KEY.course);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.course,arr);renderCourse();
}
function deleteSelectedCourse(){
    let arr=getStorage(DB_KEY.course).filter(x=>!x.check);setStorage(DB_KEY.course,arr);renderCourse();
}
function batchDownloadCourse(){alert("批量下载模拟触发");}
function batchUploadCourse(){alert("批量导入模拟触发");}
function closeCourseModal(){document.getElementById("courseModal").style.display="none";}
function editCourse(id){alert("编辑功能开发中");}

//====================7、文档模板库====================
function openTemplateModal(){
    document.getElementById("templateName").value="";
    document.getElementById("templateType").value="教案";
}
function submitTemplate(){
    let name=document.getElementById("templateName").value.trim();
    let type=document.getElementById("templateType").value;
    if(!name) return alert("模板名称必填！");
    let arr=getStorage(DB_KEY.template);
    arr.push({id:Date.now(),name,type,user:nowUser.name,check:false});
    setStorage(DB_KEY.template,arr);
    renderTemplate();closeTemplateModal();
}
function renderTemplate(){
    let arr=getStorage(DB_KEY.template);
    let html="";
    arr.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkTemplate(${i.id})"></td>
        <td>${i.name}</td><td>${i.type}</td><td>${i.user}</td><td>-</td><td>-</td><td>-</td><td><button onclick="deleteTemplate(${i.id})" class="red-btn small">删除</button></td></tr>`;
    });
    document.getElementById("templateTableBody").innerHTML=html;
}
function checkTemplate(id){
    let arr=getStorage(DB_KEY.template);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.template,arr);renderTemplate();
}
function deleteSelectedTemplate(){
    let arr=getStorage(DB_KEY.template).filter(x=>!x.check);setStorage(DB_KEY.template,arr);renderTemplate();
}
function batchDownloadTemplate(){alert("批量下载模拟触发");}
function closeTemplateModal(){document.getElementById("templateModal").style.display="none";}

//====================8、辅助工具====================
function saveNewTool(){
    let name=document.getElementById("toolNameInput").value.trim();
    let url=document.getElementById("toolUrlInput").value.trim();
    if(!name||!url) return alert("工具名称、链接必填！");
    let arr=getStorage(DB_KEY.tool);
    arr.push({id:Date.now(),name,url,check:false});
    setStorage(DB_KEY.tool,arr);
    renderTool();
    document.getElementById("toolNameInput").value="";
    document.getElementById("toolUrlInput").value="";
}
function renderTool(){
    let arr=getStorage(DB_KEY.tool);
    let html="";
    arr.forEach(i=>{
        html+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span>${i.name}</span>
            <a href="${i.url}" target="_blank">打开链接</a>
            <button onclick="editTool(${i.id})" class="blue-btn small">编辑</button>
            <button onclick="deleteTool(${i.id})" class="red-btn small">删除</button>
        </div>`;
    });
    document.getElementById("toolListContainer").innerHTML=html;
}
function editTool(id){
    let arr=getStorage(DB_KEY.tool);
    let o=arr.find(x=>x.id==id);
    document.getElementById("editToolId").value=id;
    document.getElementById("editToolName").value=o.name;
    document.getElementById("editToolUrl").value=o.url;
    document.getElementById("editToolModal").style.display="flex";
}
function updateToolLink(){
    let id=document.getElementById("editToolId").value;
    let name=document.getElementById("editToolName").value.trim();
    let url=document.getElementById("editToolUrl").value.trim();
    let arr=getStorage(DB_KEY.tool);
    let o=arr.find(x=>x.id==id);
    o.name=name;o.url=url;
    setStorage(DB_KEY.tool,arr);
    renderTool();closeEditToolModal();
}
function deleteTool(id){
    let arr=getStorage(DB_KEY.tool).filter(x=>x.id!=id);
    setStorage(DB_KEY.tool,arr);
    renderTool();
}
function closeEditToolModal(){document.getElementById("editToolModal").style.display="none";}

//====================9、参考文献库====================
function openRefUploadModal(){document.getElementById("refFileName").value="";document.getElementById("refFileCate").value="教案素材";document.getElementById("refUploadModal").style.display="flex";}
function openRefLinkModal(){document.getElementById("refLinkName").value="";document.getElementById("refLinkUrl").value="";document.getElementById("refLinkCate").value="教案素材";document.getElementById("refLinkModal").style.display="flex";}
function saveRefFile(){
    let name=document.getElementById("refFileName").value.trim();
    let cate=document.getElementById("refFileCate").value;
    if(!name) return alert("资源名称必填！");
    let arr=getStorage(DB_KEY.ref);
    arr.push({id:Date.now(),name,cate,type:"file",check:false});
    setStorage(DB_KEY.ref,arr);
    renderRef();closeRefUploadModal();
}
function saveRefLink(){
    let name=document.getElementById("refLinkName").value.trim();
    let url=document.getElementById("refLinkUrl").value.trim();
    let cate=document.getElementById("refLinkCate").value;
    if(!name||!url) return alert("资源名称、链接必填！");
    let arr=getStorage(DB_KEY.ref);
    arr.push({id:Date.now(),name,cate,url,type:"link",check:false});
    setStorage(DB_KEY.ref,arr);
    renderRef();closeRefLinkModal();
}
function renderRef(){
    let arr=getStorage(DB_KEY.ref);
    let html="";
    arr.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkRef(${i.id})"></td>
        <td>${i.name}</td><td>${i.cate}</td><td>${i.type=="file"?"文件":"外链"}</td>
        <td>-</td><td><button onclick="previewRef(${i.id})" class="gray-btn small">预览</button></td></tr>`;
    });
    document.getElementById("refTableBody").innerHTML=html;
}
function checkRef(id){
    let arr=getStorage(DB_KEY.ref);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.ref,arr);renderRef();
}
function batchDelRef(){
    let arr=getStorage(DB_KEY.ref).filter(x=>!x.check);setStorage(DB_KEY.ref,arr);renderRef();
}
function previewRef(id){alert("预览功能开发中");}
function closeRefUploadModal(){document.getElementById("refUploadModal").style.display="none";}
function closeRefLinkModal(){document.getElementById("refLinkModal").style.display="none";}
function closeRefPreviewModal(){document.getElementById("refPreviewModal").style.display="none";}

//====================10、AI课程研发====================
function openSelectSourceFile(){alert("素材选择功能开发中");}
function confirmSelectSource(){closeAiSourceModal();}
function closeAiSourceModal(){document.getElementById("aiSourceModal").style.display="none";}
function aiStartGenerate(){
    let prompt=document.getElementById("aiPrompt").value.trim();
    if(!prompt) return alert("请输入课程需求！");
    document.getElementById("aiResult").value=`基于需求：${prompt}\nAI生成的课程内容（示例）：\n课程主题：XXX\n适用学段：XXX\n课时：XXX\n课程目标：XXX\n教学流程：XXX\n实践环节：XXX\n评价方式：XXX`;
}
function saveAiToCourseRes(){
    let res=document.getElementById("aiResult").value.trim();
    if(!res) return alert("无生成结果可保存！");
    alert("已存入课程库（模拟）");
}
function exportAllAiDoc(){
    let res=document.getElementById("aiResult").value.trim();
    if(!res) return alert("无生成结果可导出！");
    downloadFile(res,"AI课程方案.txt");
}
function clearAiEdit(){
    document.getElementById("aiPrompt").value="";
    document.getElementById("aiResult").value="";
}

//====================11、课后教学反思管理====================
function openAddReflection(){
    document.getElementById("refContent").value="";
    document.getElementById("editRefId").value="";
}
function saveReflection(){
    let content=document.getElementById("refContent").value.trim();
    let editId=document.getElementById("editRefId").value;
    if(!content) return alert("反思内容不能为空！");
    let arr=getStorage(DB_KEY.reflection);
    if(editId){
        let o=arr.find(x=>x.id==editId);
        o.content=content;
    }else{
        arr.push({
            id:Date.now(),
            courseId:document.getElementById("refFilterCourse").value,
            date:document.getElementById("refFilterDate").value||new Date().toLocaleDateString(),
            user:nowUser.name,
            content,
            check:false
        });
    }
    setStorage(DB_KEY.reflection,arr);
    renderReflection();
    openAddReflection();
}
function renderReflection(filter=null){
    let list=filter||getStorage(DB_KEY.reflection);
    let courseList=getStorage(DB_KEY.course);
    let html="";
    list.forEach(i=>{
        let courseName="";
        if(i.courseId&&i.courseId!="all"){
            let course=courseList.find(c=>c.id==i.courseId);
            courseName=course?course.name:"无关联课程";
        }else{
            courseName="无关联课程";
        }
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkReflection(${i.id})"></td>
        <td>${courseName}</td><td>${i.date}</td><td>${i.user}</td><td>无附件</td>
        <td><button onclick="viewReflection(${i.id})" class="blue-btn small">查看</button></td></tr>`;
    });
    document.getElementById("reflectionTableBody").innerHTML=html;
}
function checkReflection(id){
    let arr=getStorage(DB_KEY.reflection);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.reflection,arr);renderReflection();
}
function batchDelReflection(){
    let arr=getStorage(DB_KEY.reflection).filter(x=>!x.check);setStorage(DB_KEY.reflection,arr);renderReflection();
}
function filterReflection(){
    let course=document.getElementById("refFilterCourse").value;
    let date=document.getElementById("refFilterDate").value;
    let all=getStorage(DB_KEY.reflection);
    let res=all.filter(x=>{
        let f1=(course=="all"||x.courseId==course);
        let f2=(!date||x.date==date);
        return f1&&f2;
    });
    renderReflection(res);
}
function resetRefFilter(){
    document.getElementById("refFilterCourse").value="all";document.getElementById("refFilterDate").value="";renderReflection();
}
function viewReflection(id){
    let arr=getStorage(DB_KEY.reflection);
    let o=arr.find(x=>x.id==id);
    document.getElementById("refViewBox").innerText=`关联课程：${o.courseId||'无'}\n授课日期：${o.date}\n授课人：${o.user}\n反思内容：\n${o.content}`;
    document.getElementById("refViewModal").style.display="flex";
}
function closeRefViewModal(){document.getElementById("refViewModal").style.display="none";}
function exportReflectionDoc(){
    let arr=getStorage(DB_KEY.reflection);
    let csv="关联课程,授课日期,授课人,反思内容\n";
    arr.forEach(i=>{
        let courseName="";
        if(i.courseId&&i.courseId!="all"){
            let course=getStorage(DB_KEY.course).find(c=>c.id==i.courseId);
            courseName=course?course.name:"无关联课程";
        }else{
            courseName="无关联课程";
        }
        csv+=`${courseName},${i.date},${i.user},"${i.content}"\n`;
    });
    downloadFile(csv,"教学反思.csv");
}
function openUploadRefFile(){
    let arr=getStorage(DB_KEY.reflection);
    let html=`<option value="">选择反思记录</option>`;
    arr.forEach(i=>html+=`<option value="${i.id}">${i.date} - ${i.user}</option>`);
    document.getElementById("refUploadTarget").innerHTML=html;
    document.getElementById("refUploadModal").style.display="flex";
}
function saveRefUploadFile(){alert("附件上传成功");closeRefUploadModal();}
function closeRefUploadModal(){document.getElementById("refUploadModal").style.display="none";}

//====================页面加载完成初始化====================
window.onload=function(){
    // 初始化Chart.js（首页图表占位）
    if(typeof Chart!="undefined"){
        let ctx1=document.getElementById("chart1");
        let ctx2=document.getElementById("chart2");
        if(ctx1){
            new Chart(ctx1,{
                type:"bar",
                data:{labels:["1月","2月","3月"],datasets:[{label:"示例数据",data:[10,20,30]}]}
            });
        }
        if(ctx2){
            new Chart(ctx2,{
                type:"line",
                data:{labels:["1月","2月","3月"],datasets:[{label:"示例数据",data:[10,20,30]}]}
            });
        }
    }
}
