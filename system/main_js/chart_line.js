function chart_line(container_id,chart_type,title_chart,title_x,title_y,unit_x,unit_y){
    this.data=[];
    this.dom = document.getElementById(container_id);
    this.myChart = echarts.init(this.dom,chart_type);
    this.option = null;
    this.title_chart=title_chart;
    this.title_x=title_x;
    this.title_y=title_y;
    this.option = {
        backgroundColor:'transparent',
        title: {
            text: title_chart,
            // left:'0%',
         //    top:20
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params1 = params[0];
                // console.log(params1.data.name_x);
                return params1.data.name_x + ' : ' + params1.value[0]+unit_x+'  '+ params1.data.name_y + ' : ' + params1.value[1]+unit_y;
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            type: 'value',
            name: title_x+'/'+unit_x,
            nameLocation:'middle',  
            nameGap:25,
            nameTextStyle:{
                fontWeight:'bold'
            },
            splitLine: {
                show: true,
            }
        },
        yAxis: {
            type: 'value',
            name: title_y+'/'+unit_y,
            nameLocation:'end',
         //    nameGap:35,
            nameTextStyle:{
                fontWeight:'bold'
            },
            splitLine: {
                show: true
            }
        },
        series: [{
            name: '切削力数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: this.data
        }]
    }

    this.push_data = function(x,y) {
        this.data.push({
            name: Math.random().toString(),
            name_x: this.title_x,
            name_y: this.title_y,
            value: [
                x,
                y]
        });
    }
    this.delete_data=function(){
       this.data.shift();  
    }

    this.update=function(){
        try {
             this.option.xAxis.min=this.data[0].value[0];
             this.option.xAxis.max=this.data[this.data.length-1].value[0];
        } catch (error) {
            
        }
         
         if (this.option && typeof this.option === "object") {
             this.myChart.setOption(this.option, true);
         }
    }

    
 }