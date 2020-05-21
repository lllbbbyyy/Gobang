function Stack(){
    this.top=0;
    this.dataStore=[];
    this.push=function push(element){
        this.dataStore[this.top++]=element;
    };
    this.pop=function pop(){
        return this.dataStore[--this.top];
    };
    this.peek=function peek(){
        return this.dataStore[this.top-1];
    };
    this.length=function length(){
        return this.top;
    };
    this.clear=function clear(){
        this.dataStore.length=0;
        this.top=0;
    };
}

module.exports = {
    Stack: Stack
}
