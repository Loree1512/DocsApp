"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[920],{920:(E,p,a)=>{a.r(p),a.d(p,{SignUpPageModule:()=>F});var f=a(177),s=a(4341),g=a(4742),m=a(4964),u=a(467),n=a(4438),v=a(4282),P=a(2518),b=a(3683);function M(o,r){1&o&&(n.j41(0,"div"),n.EFF(1,"El nombre es requerida"),n.k0s())}function h(o,r){if(1&o&&(n.j41(0,"div",10),n.DNE(1,M,2,0,"div",11),n.k0s()),2&o){const i=n.XpG();n.R7$(),n.Y8G("ngIf",null==i.form.controls.name.errors?null:i.form.controls.name.errors.required)}}function C(o,r){1&o&&(n.j41(0,"div"),n.EFF(1,"El email es requerido"),n.k0s())}function _(o,r){1&o&&(n.j41(0,"div"),n.EFF(1,"Ingrese un correo v\xe1lido"),n.k0s())}function O(o,r){if(1&o&&(n.j41(0,"div",10),n.DNE(1,C,2,0,"div",11)(2,_,2,0,"div",11),n.k0s()),2&o){const i=n.XpG();n.R7$(),n.Y8G("ngIf",null==i.form.controls.email.errors?null:i.form.controls.email.errors.required),n.R7$(),n.Y8G("ngIf",null==i.form.controls.email.errors?null:i.form.controls.email.errors.email)}}function S(o,r){1&o&&(n.j41(0,"div"),n.EFF(1,"La contrase\xf1a es requerida"),n.k0s())}function U(o,r){if(1&o&&(n.j41(0,"div",10),n.DNE(1,S,2,0,"div",11),n.k0s()),2&o){const i=n.XpG();n.R7$(),n.Y8G("ngIf",null==i.form.controls.password.errors?null:i.form.controls.password.errors.required)}}const y=[{path:"",component:(()=>{var o;class r{constructor(){this.form=new s.gE({uid:new s.MJ(""),email:new s.MJ("",[s.k0.required,s.k0.email]),password:new s.MJ("",[s.k0.required]),name:new s.MJ("",[s.k0.required])}),this.firebaseSvc=(0,n.WQX)(v.f),this.utilsSvc=(0,n.WQX)(P.T)}ngOnInit(){}submit(){var e=this;return(0,u.A)(function*(){if(e.form.valid){const t=yield e.utilsSvc.loading();yield t.present(),e.firebaseSvc.signUp(e.form.value).then(function(){var l=(0,u.A)(function*(d){yield e.firebaseSvc.updateUser(e.form.value.name);let c=d.user.uid;e.form.controls.uid.setValue(c),e.setUserInfo(c)});return function(d){return l.apply(this,arguments)}}()).catch(l=>{console.log(l),e.utilsSvc.presentToast({message:l.message,duration:2e3,position:"middle",color:"danger",icon:"alert-circle-outline"})}).finally(()=>{t.dismiss()})}})()}setUserInfo(e){var t=this;return(0,u.A)(function*(){if(t.form.valid){const l=yield t.utilsSvc.loading();yield l.present();let d="users/${uid}";delete t.form.value.password,t.firebaseSvc.setDocument(d,t.form.value).then(function(){var c=(0,u.A)(function*(G){t.utilsSvc.saveInLocalStorage("user",t.form.value),t.utilsSvc.routerLink("/main/home"),t.form.reset()});return function(G){return c.apply(this,arguments)}}()).catch(c=>{console.log(c),t.utilsSvc.presentToast({message:c.message,duration:2e3,position:"middle",color:"danger",icon:"alert-circle-outline"})}).finally(()=>{l.dismiss()})}})()}}return(o=r).\u0275fac=function(e){return new(e||o)},o.\u0275cmp=n.VBU({type:o,selectors:[["app-sign-up"]],decls:19,vars:8,consts:[[1,"login-section","ion-padding"],[1,"heading","ion-padding"],[1,"auth-form",3,"ngSubmit","keypress.enter","formGroup"],["icon","person-outline","type","text","label","Nombre",3,"control"],["class","validators",4,"ngIf"],["icon","mail-outline","autocomplete","email","type","email","label","Email",3,"control"],["icon","lock-closed-outline","type","password","label","Contrase\xf1a",3,"control"],[1,"action-buttons","ion-padding"],["size","large","type","submit",1,"login-button",3,"disabled"],["size","large","fill","outline","routerLink","/auth",1,"signup-button"],[1,"validators"],[4,"ngIf"]],template:function(e,t){1&e&&(n.j41(0,"ion-content")(1,"div",0)(2,"div",1)(3,"h1"),n.EFF(4,"Crear cuenta"),n.k0s(),n.j41(5,"p"),n.EFF(6,"Tus documentos mucho m\xe1s seguros"),n.k0s()(),n.j41(7,"form",2),n.bIt("ngSubmit",function(){return t.submit()})("keypress.enter",function(){return t.submit()}),n.nrm(8,"app-custom-input",3),n.DNE(9,h,2,1,"div",4),n.nrm(10,"app-custom-input",5),n.DNE(11,O,3,2,"div",4),n.nrm(12,"app-custom-input",6),n.DNE(13,U,2,1,"div",4),n.j41(14,"div",7)(15,"ion-button",8),n.EFF(16,"Crear Cuenta"),n.k0s(),n.j41(17,"ion-button",9),n.EFF(18,"Volver a inicio de sesi\xf3n"),n.k0s()()()()()),2&e&&(n.R7$(7),n.Y8G("formGroup",t.form),n.R7$(),n.Y8G("control",t.form.controls.name),n.R7$(),n.Y8G("ngIf",t.form.controls.name.errors&&t.form.controls.name.touched),n.R7$(),n.Y8G("control",t.form.controls.email),n.R7$(),n.Y8G("ngIf",t.form.controls.email.errors&&t.form.controls.email.touched),n.R7$(),n.Y8G("control",t.form.controls.password),n.R7$(),n.Y8G("ngIf",t.form.controls.password.errors&&t.form.controls.password.touched),n.R7$(2),n.Y8G("disabled",t.form.invalid))},dependencies:[f.bT,s.qT,s.cb,g.Jm,g.W9,g.N7,m.Wk,b.H,s.j4],styles:["ion-content[_ngcontent-%COMP%]{--background: linear-gradient(180deg,rgba(0,0,0,.7),rgba(0,0,0,.1)), url(/assets/background-login.png) no-repeat center center / cover;display:flex;flex-direction:column;justify-content:center;height:100%}.login-section[_ngcontent-%COMP%]{height:90dvh;width:100%;max-width:500px;background:#fff;right:0;left:0;bottom:0;position:fixed;margin:auto;border-top-left-radius:46px;border-top-right-radius:46px}.login-section[_ngcontent-%COMP%]   .heading[_ngcontent-%COMP%]{margin-top:20px;text-align:center}.login-section[_ngcontent-%COMP%]   .heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:1.8rem;font-weight:bolder;color:#375a13}.login-section[_ngcontent-%COMP%]   .heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-top:20px;font-size:1rem;color:#7b7b7b}.login-section[_ngcontent-%COMP%]   .login-form[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]{position:relative;margin-bottom:15px}.login-section[_ngcontent-%COMP%]   .login-form[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]::part(native){padding-left:0}.login-section[_ngcontent-%COMP%]   .login-form[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]   ion-icon[_ngcontent-%COMP%]{position:relative;top:36px;z-index:2;font-size:1.2rem;left:5px}.login-section[_ngcontent-%COMP%]   .login-form[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]   ion-label[_ngcontent-%COMP%]{position:absolute;margin-left:35px;font-weight:bolder;font-size:.8rem;top:3px}.login-section[_ngcontent-%COMP%]   .login-form[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]   ion-input[_ngcontent-%COMP%]{font-size:.9rem;--padding-start: 36px;--padding-bottom: 0px;color:#7b7b7b}.login-section[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]{text-align:center}.login-section[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .login-button[_ngcontent-%COMP%]{--background: #afc8b2;width:100%;font-weight:700}.login-section[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-top:15px;font-size:1rem;color:#7b7b7b}.login-section[_ngcontent-%COMP%]   .action-buttons[_ngcontent-%COMP%]   .signup-button[_ngcontent-%COMP%]{border:2px solid #afc8b2;background:transparent;--color: #afc8b2;font-weight:700;margin-top:30px;width:100%;--border-color: #afc8b2;--background: transparent;--background-activated: transparent;--background-focused: transparent;--background-hover: transparent}"]}),r})()}];let k=(()=>{var o;class r{}return(o=r).\u0275fac=function(e){return new(e||o)},o.\u0275mod=n.$C({type:o}),o.\u0275inj=n.G2t({imports:[m.iI.forChild(y),m.iI]}),r})();var x=a(3887);let F=(()=>{var o;class r{}return(o=r).\u0275fac=function(e){return new(e||o)},o.\u0275mod=n.$C({type:o}),o.\u0275inj=n.G2t({imports:[f.MD,s.YN,g.bv,k,x.G]}),r})()}}]);