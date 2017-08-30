/**
 * 重写el-form
 * 
 */

var CompForm = {
  extends: Vue.options.components['ElForm'],
  data:function(){
      return { 
    	  oldRender:Vue.options.components['ElForm'].options.render,
      }
  },
  props:{
      view: {
        type: Boolean,
        default: false
      },
  },
  
  render: function (createElement) {
      if(!this.view){
    	  return this.oldRender();
      }else{
    	  return createElement('table',{
    		  cellspacing:"0",
    		  cellpadding:"0",
    		  border:"0",
    		  width:"100%",
    		  class:'ssr-table',
    	  },this.$slots.default)
      }
  },
}

//delete CompForm.extends.options.render;
//CompForm.extends.options.template = " <form v-if='!view' class=\"el-form\" :class=\"[\n    labelPosition ? 'el-form--label-' + labelPosition : '',\n    \t    { 'el-form--inline': inline }\n    \t  ]\">\n    \t    <slot></slot>\n    \t  </form>\n    \t  <table v-else cellspacing=\"0\" cellpadding=\"0\" border=\"0\"  width=\"100%\" class='ssr-table'>\n    \t    <slot></slot>\n    \t  </table>";
  
Vue.component('el-form', CompForm)

var CompFormItem = {
  extends: Vue.options.components['ElFormItem'],
  data:function(){
      return { 
    	  h: function(){
          },
    	  oldRender:Vue.options.components['ElFormItem'].options.render,
      }
  },
  props:{
	  vlabel: {type: String,default: false},
  },
  methods:{
	  getTd:function(slots){
		  var items = [];
		  var labelElement = null;
		  var valueElement = null;
		  var labelText = this.vlabel ? this.vlabel : this.label + this.form.labelSuffix;
	      labelElement = this.h('td',{'class':'ssr-table-label'},labelText);

	      //el-form循环找到有componentOptions的el组件
	      if(slots && Array.isArray(slots) && slots.length>0){
	    	  var temp = slots;
		      while (typeof temp[0].componentOptions == "undefined" ) {
		    	  temp = temp[0].children;
		      }
		      slots = temp;
	      }
	      //设置value值
	      try{
		      if(this.isTag(slots,'el-radio-group')){
				  valueElement = this.h('td',{'class':'ssr-table-value ssr-table__text'},this.getRadioValue(slots[0]))
			  }else if(this.isTag(slots,'el-input')){
				  var value = slots[0].componentOptions.propsData.value
				  valueElement = this.h('td',{'class':'ssr-table-value ssr-table__text'},value)
			  }else if(this.isTag(slots,'el-date-picker')){
				  var value = slots[0].componentOptions.propsData.value
				  valueElement = this.h('td',{'class':'ssr-table-value ssr-table__text'},value)
			  }else if(this.isTag(slots,'el-checkbox-group')){
				  valueElement = this.h('td',{'class':'ssr-table-value ssr-table__text'},this.getCheckGroupValue(slots[0]))
			  }else if(this.isTag(slots,'el-select')){
				  valueElement = this.h('td',{'class':'ssr-table-value ssr-table__text'},this.getSelectValue(slots[0]))
			  }
			  else{
				  valueElement = this.h('td',{'class':'ssr-table-value'},slots)
			  }
		  }catch(err){
			  valueElement = this.h('td',{'class':'ssr-table-value'},err+"")
		  }
		  
	      
	      
	      items.push(labelElement);
	      items.push(valueElement);
	      
		  return items;
	  },
	  isTag:function(slots,tagName){
		  if(slots && Array.isArray(slots) && slots.length>0 
				  && slots[0].componentOptions.tag == tagName){
			  return true;
		  }else{
			  return false;
		  }
	  },
	  getRadioValue:function(slot){
		  var value = "";
		  var label = "";
		  var value = slot.componentOptions.propsData.value;
		  var childrens = slot.componentOptions.children;
		  for(var key in childrens){
			  var item = childrens[key];
			  if(typeof item.tag == "undefined"){
				  continue;
			  }
			  var temp = item;
		      while (typeof temp.componentOptions == "undefined" ) {
		    	  temp = temp.children[0];
		      }
		      item = temp;
		      
			  if(item.componentOptions.propsData.label == value){
				  label = item.componentOptions.children[0].text
				  break;
			  }
		  }
		  return label;
	  },
	  getSelectValue:function(slot){
		  var value = "";
		  var label = "";
		  var value = slot.componentOptions.propsData.value;
		  var childrens = slot.componentOptions.children;
		  if(!!value){
			  for(var key in childrens){
				  if(typeof childrens[key].tag == "undefined"){
					  continue;
				  }
				  if(childrens[key].componentOptions.propsData.value == value){
					  label = childrens[key].componentOptions.propsData.label
					  break;
				  }
			  }
		  }
		  return label;
	  },
	  getCheckGroupValue:function(slot){
		  var labels = [];
		  var values = slot.componentOptions.propsData.value;
		 
		  var childrens = slot.componentOptions.children[0].children;
		  if(!!values &&　values.length>0){
			  for(var key in childrens){
				  var item = childrens[key]
				  if(typeof childrens[key].tag == "undefined"){
					  continue;
				  }
				  for(var i in values){ 
					  if(item.children["0"].componentOptions.propsData.label == values[i]){
						  labels.push(item.children["0"].componentOptions.children["0"].text.replace(/(^\s*)|(\s*$)/g, ""));
						  break;
					  }
				  }
			  }
			  if(labels.length == 0){
				  labels = slot.componentOptions.propsData.value
			  }
		  }
		  return labels.join();
	  }
	  
  },
  render: function (createElement) {
      if(!this.form.view){
    	  return this.oldRender();
      }else{
    	  this.h = createElement;
    	  return createElement('tr',{
    		  class:'ssr-form-item__view',
    	  },this.getTd(this.$slots.default))
      }
  },
}

//delete CompFormItem.extends.options.render;
//CompFormItem.extends.options.template = "<div v-if='!form.view' class=\"el-form-item\" :class=\"{\n    'is-error': validateState === 'error',\n    'is-validating': validateState === 'validating',\n    'is-required': isRequired || required\n  }\">\n    <label :for=\"prop\" class=\"el-form-item__label\" v-bind:style=\"labelStyle\" v-if=\"label || $slots.label\">\n      <slot name=\"label\">{{label + form.labelSuffix}}</slot>\n    </label>\n    <div class=\"el-form-item__content\" v-bind:style=\"contentStyle\">\n      <slot></slot>\n      <transition name=\"el-zoom-in-top\">\n        <div class=\"el-form-item__error\" v-if=\"validateState === 'error' && showMessage && form.showMessage\">{{validateMessage}}</div>\n      </transition>\n    </div>\n  </div>\n  <tr v-else>\n    <td class='ssr-table-label'>{{label + form.labelSuffix}}</td>\n    <td><slot></slot></td>\n  </tr>";
//  
Vue.component('el-form-item', CompFormItem)