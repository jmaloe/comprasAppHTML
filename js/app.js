$(document).ready(function(e) {
	
	getProductos();  //cargamos la lista de productos en app.js
	getMaxId(); //inicializamos el max id en app.js
	getMyList(); //recupero mi lista del mandado
	
    $("#agregar").click(function(){
	  addProductItem({id:0, precio:0, nombre:$("#producto").val()});
	});
	
	$("#mi_lista").on('click','.remove',function()
	{		
		$(this).parent().parent().parent().remove();
		removeFromMyList({id:$(this).parent().parent().parent().attr("id")});
		calcularGranTotal();
	});

	$("#mi_lista").on('click','.descripcion', function(){		
		var id_p = $(this).parent().attr('id');
		if($(this).parent().hasClass("checkeado"))
		{
		  	$(this).parent().removeClass("checkeado");
		  	updateFromMyList({id:id_p, cantidad:-1, checked:false});
		}
		else
		{
			$(this).parent().addClass("checkeado");
			updateFromMyList({id:id_p, cantidad:-1, checked:true});
		}
	});	
	
	$("#mi_lista").on('change','input',function()
	{
		try{
		var obj = getCurrentItem(this); 
	
		 if(obj.precio=="")
		   obj.precio=0;
		   		
		 if(obj.cantidad=="")
		   obj.cantidad=0;
		   
		  actualizarProducto({id:obj.id, precio:obj.precio});
		  if($(this).attr("id")=="cant")
		  {
			if($(this).val()!="")
			  updateFromMyList({id:obj.id, cantidad:obj.cantidad, checked:false});
		  }
		  var totalFromItem = parseFloat(obj.precio * obj.cantidad);
		$(this).parent().parent().parent().find('td[id="total"]').text(totalFromItem);		
		calcularGranTotal();
		}catch(e){alert("Error:"+e.message)}
	});

	$("#producto").focus(function(){
		$("#productos").show();
	});

	$("#producto").focusout(function(){
		setTimeout(function(){$("#productos").hide();},500);
	});	
	
	$(".productos").on('click','li>.product_name',function(){
		console.log("Agregando producto..."+$(this).text());
		addProductItem({id:$(this).parent().attr("id"), precio:$(this).parent().attr("precio"), nombre:$(this).text()});
		calcularGranTotal();
		$("#productos").hide();
		$("#producto").focus();
	});

	$(".productos").on('click','.delete-item',function(e){
		e.preventDefault();
		console.log("Eliminando producto..."+$(this).parent().attr("id"));
		var id_prod = $(this).parent().attr("id"); //obtener el id del producto a eliminar
		$("#mi_lista").find('tr[id="'+id_prod+'"]').remove(); //eliminar el elemento de la tabla
		
		if(id_prod!=0)
		{
			removeFromMyList({id:id_prod});
			eliminarProducto({id:id_prod}); //eliminar producto de la base de datos
			$(this).parent().remove(); //remover producto del listview
			$("#producto").val("");
		}
		if(!$("#productos").is(":visible"))
			$("#productos").show();
		calcularGranTotal(); //si se eliminó producto de la lista de items y se encontraba en la tabla volvemos a recalcular
	});
	
	function addProductItem(data){
	 var id_prod = data.id, 
		 precio_prod = data.precio;
		 
	 if($("#mi_lista").find('tr[id="'+id_prod+'"]').attr("id")!=undefined)
	 {
	   alert("El articulo ya está en la lista");
		  return;
	 }
		
	 if(id_prod==0)
	 {
		guardarProducto( {nombre:data.nombre, precio:0} );
		id_prod = getProductId();
	 }	 
	 addToMyList({id:id_prod, cantidad:1, checked:false}); //agregamos el prod a nuestra lista

		showProducto({id:id_prod, descripcion:data.nombre, precio:precio_prod, cantidad:1});
		var total_ant = $("#gran-total").val();
		var	bigtotal = parseFloat(total_ant)+(precio_prod * 1);
		$("#gran-total").val(bigtotal);
		$("#producto").val("");
	}
	
	function getDatalistVal(atrib){
			var value=0;
			var producto = $("#producto").val();
			value = $("#productos").find('option[value="'+producto+'"]').attr(atrib);
			//alert("valor:"+value)
			if(value==undefined)
				value=0;
			return value;
			
	}
	
	function getCurrentItem(current){
		return {
			id :  $(current).parent().parent().parent().attr('id'),
		    precio : $(current).parent().parent().parent().find('input[id="precio"]').val(),
			cantidad : $(current).parent().parent().parent().find('input[id="cant"]').val()
			};
	}
	
	function calcularGranTotal(){		
		suma=0;
		totitems=0;
		$("td").each(function()
		{
			if($(this).is("#total")){
				suma+=parseFloat($(this).text());
				totitems++;
			}
		});
		$("#gran-total").val(suma);
		$("#total_items").text(totitems+" artículos");
	}	
});