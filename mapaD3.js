function f(dataset,e) {
$(document).keyup(function(e) {
     if (e.keyCode == 27) { // escape key maps to keycode `27`
         normalMode();
                 redraw();
    }
});

    var max_intercambistas = Dashboards.getParameterValue('valor_max_intercambistas');
    var data = this.cdaResultToD3Array(dataset);
    var cont = 0;
    var botaoFull ;
    var botaoExit ;
    var zoomPlus = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
    var originalContainer;

function zoomed() {
    g.attr("transform",
        "translate(" + zoomPlus.translate() + ")" +
        "scale(" + zoomPlus.scale() + ")"
    );
}


var tooltip = d3.select("#container_mapa")
            .append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);


var width = document.getElementById('container_mapa').offsetWidth;
var height = width/2;

var width2 = document.getElementById('container_mapa').offsetWidth;
var height2 = width/2;

function arredondar(valor){
    valor = Math.round(valor);
    if(valor >= 10){
        if((valor % 10) >= 5){
            return Math.round((valor)/10)*10 + 10;
        }
        else{
            return Math.round((valor/10))*10;
        }
    }
    else{
        
        return valor;
    }
}

var domain_max;
if(max_intercambistas < 5){
    if(max_intercambistas > 0)
    {
        domain_max = [1, 2, 3, 4, 5];
    } else 
    {
        domain_max = [0, 0, 0, 0, 0];
    }
}
else {
    domain_max = [max_intercambistas > 0?1:0, arredondar(max_intercambistas*0.25), 
    arredondar(max_intercambistas*0.5), arredondar(max_intercambistas*0.75),
    arredondar(max_intercambistas)];
}

var color = d3.scale.linear() // escala para colorir
                .domain(domain_max)
                .range(["#F1D4AF","#F8CA00","#E97F02","#C02942","#490A3D"]); //vai de uma cor clara p uma escura

var colorIncoming = d3.scale.linear() // escala para colorir
                .domain(domain_max) 
                .range(["#F1D4AF","#F8CA00","#E97F02","#C02942","#490A3D"]); 
var topo,projection,path,svg,g,lista;

projection = d3.geo.mercator()
    .translate([480,350])

    .scale(width / 2 / Math.PI);

    path = d3.geo.path()
        .projection(projection);

    svg = d3.selectAll("#container_mapa").append("svg") 
      .attr("id","teste")
      .attr("width", 100+"%")
      .attr("height",height)
       .append("g").attr("id","mapamovel")
         .style("width","100%")
        .style("height", "100%")    ;

g = svg.append("g");                                    

svg .append("rect")
    //adicionei isso ao svg para conseguir dar zoom no oceano
    .attr("id", "background");
        
d3.select("#background")
        .attr("width", "100"+"%")
            .attr("height", "100"+"%");

g = svg.append("g").attr("id","mapG");
svg.call(zoomPlus);    

if(max_intercambistas === 0){
    var texto = svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 500)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text("Não há alunos na opção selecionada.");
}

//isso é para a legenda
var legendRectSize = 20;
var legendSpacing = 20; //alterei aqui p/ o texto ficar melhor

// var legendText = ["1 aluno", "até 100 alunos", "até 250 alunos", "até 500 alunos", "até 1000 alunos"];
var legendText = [];

for (i = 0; i < domain_max.length; i++) {
    legendText.push(parseInt(domain_max[i],10) == 1? 
                    parseInt(domain_max[i],10) + " aluno" : 
                    parseInt(domain_max[i],10) + " alunos");
}

var legend = d3.select('svg')
    .append("g")
    .selectAll("g")
    .data(color.domain())
    .enter()
    .append("g")
      .attr("class", "legend")
      .attr('transform', function(d, i) {
        return 'translate(' + 20 + ',' + 460 + ')'; //precisa desenhar apenas uma vez 
    }) ;


    legend.append('text')
        .data(legendText)
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', function(d,i){
            return legendRectSize - i * 26 + 85; //alterei aqui p melhorar a posição do texto
        })
        .text(function(d) { return d; });

//
// Legenda com cor gradiente
//

//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

//Vertical gradient
linearGradient
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "20%");

    //Append multiple color stops by using D3's data/enter step
linearGradient.selectAll("stop")
    .data( color.range() )
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(color.range().length-1); })
    .attr("stop-color", function(d) { return d; });

//Draw the rectangle and fill with gradient
legend.append('rect')
     .attr("width", 20)
     .attr("height", 120)
     .style("fill", "url(#linear-gradient)")
     .attr('x', 0) //aqui, coloquei apenas uma posição para o retangulo
     .attr('y', -10);

//
// Botões de Zoom
//
var qtBotao = [" + "," - "];
    botao = d3.select("svg")
            .append("g")
            .selectAll("g")
            .data(qtBotao)
            .enter()
                .append("g")              
                .attr("class","botaoZ")
                .attr("transform",function(d,i){
                    
                    var y= height2-150 + 30*(i+1);
                   //  alert("tamamnho da tela altura : " + height2 + "y : " + y);
                    var x = width2-100;
                  / / 
                //    alert("tamamnho da tela : " + width2 + "x : " + x);
                    return "translate("+x+" ,"+y+")";
                    
                });
                
        botao.append("rect")  
                    .attr("class","zoombutton")
                    .style("fill","#555555")
                    .style("stroke","white")                   
                    .attr('width', 35)
                    .attr('height', 20);
                    
   texto= botao.append("text").data(qtBotao).text(function(d){
        return d;
    })
                       .attr('x', 10)
                        .attr('y', 14)
                        .style("font-size","15px")
                        .style("fill","white");
            
       
       botao.on("mouseover", function() {  

    d3.select(this)
           .attr("stroke-width","5");
      
           
           });
         botao.on("mouseout", function() {  

    d3.select(this)
           .attr("stroke-width","1");
                 
           });
           
        botao.on("click",function(d){
         
        var clicked = d3.event.target,
        direction = 1,
        factor = 0.2,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoomPlus.scaleExtent(),
        translate = zoomPlus.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoomPlus.scale()};
        d3.event.preventDefault();
        direction = (d === " + ") ? 1 : -1;
        target_zoom = zoomPlus.scale() * (1 + factor * direction);

         if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
    
        view.x += center[0] - l[0];
        view.y += center[1] - l[1];
   
        interpolateZoom([view.x, view.y], view.k);

        })  ; 
        
//botao de full dentro do Mapa 
   
criarBotaoFull();  

function criarBotaoFull(){


var fullscreen = [" ⛶ " ];
 botaoFull = d3.select("svg")
            .append("g")
            .selectAll("g")
            .data(fullscreen)
            .enter()
                .append("g")              
                .attr("class","botaoFull")
                .attr("transform",function(d,i){
                    var y= height2-80 + 30*(i+1);
                     var x = width2-100 ;
                   // alert(x)
                    return "translate("+x+" ,"+y+")";
                    
                });
                
botaoFull.append("rect")  
                    .attr("class","fullbutton")
                    .style("fill","#555555")
                    .style("stroke","white")                   
                    .attr('width', 35)
                    .attr('height', 25);
                    
  texto2= botaoFull.append("text").data(fullscreen).text(function(d){
        return d;
    })
                       .attr('x', 10)
                        .attr('y', 18)
                        .style("font-size","15px")
                        .style("fill","white");
            
                    
                    
botaoFull.on("mouseover", function() {  
                    /*background-color: white;
                    color:#555555;*/
                    d3.select(this)
                    .attr("stroke-width","5");
           });
           
botaoFull.on("mouseout", function() {  
                    /*background-color: white;
                    color:#555555;*/
                    d3.select(this)
                    .attr("stroke-width","1");
 
            });
           
        botaoFull.on("click",function(d){ 
            //clickfull();
            fullscreenMode();
            
            });                   
                
}

function fullscreenMode(){

var w = document.getElementById("container_mapa").offsetWidth;
var h = document.getElementById("container_mapa").offsetHeight;

//abrir no meio da tela uma tooltip ?
//"Pressione ESC para sair do modo tela cheia"


 //   botaoFull.remove();
    botaoFull.style("visibility","hidden");
      $('html, body').animate({
            scrollTop: $("#dri_header").offset().top
        }, 0);
        
      
        $( "#row_tabela_intercambista" ).hide();
        $( "#Filtros" ).hide();
        $( "#dri_header" ).hide();      
        $( "#Header_filtros" ).hide();
        $( "#Header" ).hide();
        $( "#Spacer" ).hide();
        $( "#Spacer_new" ).hide();
        
    // Edicoes para o CSS de .container
    originalContainer = d3.selectAll(".container");
    
    d3.selectAll(".container")
        .style("background-color","#b3e0ff")
        .style("margin-right","0")
        .style("margin-left","0")
        .style("position","fixed")
        .style("top","0")
        .style("bottom","0")
        .style("right","0")
        .style("left","0")
        .style("width","100%");
        
      
    //Fim .container CSS
    
  //Edicoes CSS para #row_conteudo
         d3.selectAll("#row_conteudo")
        .style("background-color","pink")
        .style("height","100%")
        .style("width","100%");
    // Fim CSS para #row_conteudo
    
    // Edicoes CSS para coluna
    
    d3.selectAll(".col-xs-12")
        .style("height","100%");
        
    d3.selectAll("#coluna_mapa")
        .style("height","100%");
   
        
    d3.selectAll("#teste")
        .style("height","100%");
    //Edicoes
   
  addCenterTooltip();
    
    //criar botao exit    
    var exit = [" X "];   
        botaoExit = d3.select("svg")
        .append("g")
        .selectAll("g")
        .data(exit)
        .enter()
        .append("g")              
        .attr("class","botaoE")
        .attr("transform",function(d,i){
            var y=h-100 + 30*(i+1);
            var x = w - 100;
            return "translate("+x+" ,"+y+")";
        });
            
        botaoExit.append("rect")  
            .attr("class","btnExit")
            .style("fill","#555555")
            .style("stroke","white")                   
            .attr('width', 35)
            .attr('height', 20);
            
            
        textoExit= botaoExit.append("text").text(" X ") //sugestão Diniz
            .attr('x', 10)
            .attr('y', 14)
            .style("font-size","15px")
            .style("fill","white");
            
        redraw();
            
        botaoExit.on("mouseover", function() {           
             d3.select(this)
                 .attr("stroke-width","5");
        });
            
            botaoExit.on("mouseout", function() {  
            
                d3.select(this)
                    .attr("stroke-width","1");
            });
           
            d3.select("#mapamovel")
            .attr("transform","translate("+ 100+","+ 100 +")scale(1.25)");
            
             botaoExit.on("click",function f(){  
                normalMode();
                redraw();
             });
             //ajuste posição legenda
             legend.attr("transform", function(d,i){
                return 'translate(' + 20 + ',' + 700 + ')';
            });
                          

}

function addCenterTooltip(){
    //abrir no meio da tela uma tooltip ?
    //"Pressione ESC para sair do modo tela cheia"
    var tooltip = d3.select("body").append("div").attr("id","escape")
    tooltip.style("width","40%")
          .style("height","10%")
          .style("background-color","grey")
          .style("opacity","0.6")
          .style("position","absolute")
          .style("left","30%")
          .style("top","5%")
          .style("border-radius","25px");
          
    tooltip.text("Pressione ESC para sair do modo tela cheia")
            .style("text-align","center")
            .style("font-size","20px")
            .style("padding-top","10px");
            
    //$("#escape").delay(2000).fadeOut();
    $("#escape").fadeOut(3000);
    setTimeout(function(){ 
        tooltip.remove();
    
    }, 2000);
}

function normalMode(){    
   //  botaoExit.remove();
        botaoExit.style("visibility","hidden");
        botaoFull.style("visibility","visible")
   
       $( "#row_tabela_intercambista" ).show();
        $( "#Filtros" ).show();
        $( "#dri_header" ).show();      
        $( "#Header_filtros" ).show();
        $( "#Header" ).show();
        $( "#Spacer" ).show();
        $( "#Spacer_new" ).show();
        
    //CSS .container para voltar ao normal mode
    $(".container").removeAttr("style");
    
    //CSS #row_conteudo para voltar ao normal mode
    $("#row_conteudo").css("height", "");
    $("#row_conteudo").css("width", "");
    $("#row_conteudo").css("background-color", "");
  
    //CSS .col para voltar ao normal mode    
        d3.selectAll(".col-xs-12")
        .style("height","")
        .style("background-color","");
     
     //---------------
     
    $("#coluna_mapa").removeAttr("style");   
    
    d3.select("#mapamovel")
         .attr("transform","translate(0,0)scale(1)");
    
    $('html, body').animate({
        scrollTop: $("#row_conteudo").offset().top
    }, 1000);
}


function clickfull(){
var w = Math.max(window.innerWidth);
var h = Math.max(window.innerWidth);

 botaoFull.remove();
      $('html, body').animate({
            scrollTop: $("#dri_header").offset().top
        }, 0);
        
        $( "#row_tabela_intercambista" ).hide();
        $( "#Filtros" ).hide();
        $( "#dri_header" ).hide();      
        $( "#Header_filtros" ).hide();
        $( "#Header" ).hide();
        $( "#Spacer" ).hide();
        $( "#Spacer_new" ).hide();
 
 
d3.select("body")
     .style("width",w)
    .style("height",h);
    
d3.select("#row_conteudo") 
    .style("width",w)
    .style("height",h);
        
var container = d3.selectAll(".container");
container.attr("width",w)
        .attr("height",h)
        .style("padding-right","0")
        .style("padding-left","0")
        .style("margin-right","0")
        .style("margin-left","0");

var elem = d3.select("#container_mapa")
            .style("height","100%")
             .style("height",h)
            .style("width",w);
            
d3.select("#teste")
            .style("height","100%")
             .style("height",h)
            .style("width",w);
        

elem.style("z-index","99");
elem.style("postion","fixed")
    .style("top","0")
    .style("left","0") 
    .style("bottom","0")
    .style("margin-right","0")
    .style("margin-left","0");


function redrawFull(){
    var w = Math.max( window.innerWidth);
    var h = Math.max(window.innerWidth);
    d3.select("body")
        .style("width",w)
        .style("height",h);
    
d3.select("#row_conteudo") 
    .style("width",w)
    .style("height",h);
    
var container = d3.selectAll(".container");
container.style("width",w)
        .style("height",h)
        .style("padding-right","0")
        .style("padding-left","0")
        .style("margin-right","0")
        .style("margin-left","0");
        
var elem = d3.select("#container_mapa")
            .style("height","100%")
             .style("height",h)
            .style("width",w);
 
 d3.select("#teste")
            .style("height","100%")
           
            .style("width",w);
        

elem.style("z-index","99");
elem.style("postion","fixed")
    .style("top","0")
    .style("left","0") 
    .style("margin-right","0")
    .style("margin-left","0");
}
  
}    
                                                                                            
d3.selectAll("#botao").append("button").attr("id","full")
    .attr("class","botaofull")
    .text(" <> ");       
    
d3.select("#full").on("click",function f(){
    
    clickfull();
    
});

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoomPlus.translate(), translate),
            iScale = d3.interpolate(zoomPlus.scale(), scale);
        return function (t) {
            zoomPlus
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

d3.json("https://dl.dropboxusercontent.com/s/kcu8sg8txdlfcoy/countries-topo.json", function(error, world) {
    var countries = topojson.feature(world, world.objects.subunits).features;
    topo = countries;
    draw(topo);
});



function draw(topo) {

  var country = g.selectAll(".country").data(topo);

  country.enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", function(d, i) { 
            if(Dashboards.getParameterValue("tipo_intercambio")=='EXTERIOR')
            {
                for(j=0 ; j < data.length ; j++)
                {
                    cont =0;
                    if(d.id == data[j].ISO31661A3){
                      cont = data[j].QUANTIDADE + cont;
                            for(k=j+1;k<data.length;k++){
                                if(d.id == data[k].ISO31661A3){
                                    cont = data[k].QUANTIDADE + cont;
                                }
                               
                            }
                            
                        return color(cont);
                    }
                }
            } else if (Dashboards.getParameterValue("tipo_intercambio")=='UFMG')
            {
                for(j=0 ; j < data.length ; j++)
                {
                    cont =0;
                    if(d.id == data[j].CAD_PAISNACIONALIDADE_CHR){
                      cont = data[j].QUANTIDADE + cont;
                            for(k=j+1;k<data.length;k++){
                                if(d.id == data[k].CAD_PAISNACIONALIDADE_CHR){
                                    cont = data[k].QUANTIDADE + cont;
                                }
                               
                            }
                            
                        return colorIncoming(cont);
                    }
                }  
            }
            return "#dbdbdb";
      
       });
        

    //ofsets plus width/height of transform, plsu 20 px of padding, plus 20 extra for tooltip offset off mouse
    var offsetL = document.getElementById('container_mapa').offsetLeft+(width/2)+40;
    var offsetT =document.getElementById('container_mapa').offsetTop+(height/2)+20;

     country.on("click",function f(d,e){
         
            var mouse = d3.mouse(svg.node()).map( function(d) {
				return parseInt(d,10);
            });

   //criar um elemento circulo onde for clicado
  //  .attr("style", "left:"+(mouse[0]+100)+"px;top:"+(mouse[1]+10)+"px"); 
  var p = svg
            .append("circle")
            .attr("id", "provisorio")
            .attr("cx", function() {
                   return mouse[0];
            })
            .attr("cy", function() {
                return mouse[1];
            })
            .attr("r","0px")
            .style("fill", "black")	;

        // console.log(d3.event.target);
        // console.log(p[0][0]);
   
        Dashboards.fireChange('pais_cod',d.id); //minha data aqui o topojson
        // Se intercâmbio é "incoming"
        if( Dashboards.getParameterValue("tipo_mobilidade") == 'Internacional' &&
            Dashboards.getParameterValue("tipo_intercambio") == 'EXTERIOR')
        {
            Dashboards.update([render_tabela_pais]);
        } else {
            Dashboards.update([render_tabela_pais_incoming]);
        }
        
        window.document.getElementsByClassName('popupComponent')[1].style.visibility = 
                'visible';       
        
        render_popup_pais.popup($(p[0][0]));
        p.remove();
          
    });

}

    setTimeout(function(){
     var c= g.selectAll("circle")
        .data(data)
        .enter()
            .append("circle")
            .attr("class", "circulo")
            .attr("cx", function(d) {
                   return projection([d.LONGITUDE, d.LATITUDE])[0];
            })
            .attr("cy", function(d) {
                return projection([d.LONGITUDE, d.LATITUDE])[1];
            })
            .attr("r","1px")
            .style("fill", "black")	
            .style("opacity", 0.85)	
            .style("stroke", "dimgrey");          

          var offsetL = document.getElementById('container_mapa').offsetLeft+(width/2)+40;
          var offsetT = document.getElementById('container_mapa').offsetTop+(height/2)+20;
       

c.on("click",function f(d){
    Dashboards.fireChange('ins_codigo',d.SK_INSTITUICAO);
    Dashboards.update([render_tabela_instituicao]);
    window.document.getElementsByClassName('popupComponent')[0].style.visibility = 
        'visible';  
        
    render_popup_instituicao.popup($(d3.event.target));
})
       
    .on("mouseover", function(d) {      
        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip.transition()
            .duration(100)
            .style("opacity", .9)
            .attr("style", "left:"+(mouse[0]+100)+"px;top:"+(mouse[1]+10)+"px"); 
            tooltip.text(d.SK_INSTITUICAO + '-' + d.NOME); 
	})
    
    .on("mouseout", function(d) {        
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

},2500);

function move() {
    
    g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection));
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 

}

window.addEventListener("resize", redraw);

function redraw(){
  
//change SVG width to the cotainer_mapa width
var w = document.getElementById("container_mapa").offsetWidth;
var h = document.getElementById("container_mapa").offsetHeight;

botao.attr("transform",function(d,i){
                    
                    var y= h-160+ 30*(i+1);
                    var x = w-100;
                    return "translate("+x+" ,"+y+")";
                    
                });

botaoFull.attr("transform",function(d,i){
                    var y=h-100 + 30*(i+1);
                    var x = w - 100;
                    return "translate("+x+" ,"+y+")";
                    
                });


botaoFull.style("position","fixed")
        .style("bottom","5px")
        .style("right","0");
  
  
botaoExit.attr("transform",function(d,i){
                    var y=h-100 + 30*(i+1);
                    var x = w - 100;
                    return "translate("+x+" ,"+y+")";
                });


botaoExit.style("position","fixed")
        .style("bottom","5px")
        .style("right","0");
        

legend.attr("transform", function(d,i){
         return 'translate(' + 20 + ',' + 460 + ')';
    });

}

 
} 
