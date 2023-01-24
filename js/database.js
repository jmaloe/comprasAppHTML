function openDB()
{ 
 try
 {
    if (window.openDatabase)
	{
        //Will either return the existing database or null and call our creation callback onDBCreate
        var db = window.openDatabase('db_productos', '1.0', 'The most awesome database ever', 5 * 1024 * 1024);
		if (db)
		{
          db.transaction(function(conex)
		  {
           conex.executeSql("CREATE TABLE IF NOT EXISTS productos (id integer unique, nombre text, precio float)", [], 
			 function(conex, result)
			 {
			   //alert("Tabla PRODUCTOS creada");
             }
			);
		   conex.executeSql("CREATE TABLE IF NOT EXISTS mi_lista (id integer unique, cantidad float, checked boolean)", [], 
			 function(conex, result)
			 {
			   //alert("Tabla mi_lista creada");
             }
			);
			
          });
		  
		  return db;
        }
    }
	else
	{
        alert("Este dispositivo no tiene soporte WebSQL");
    }
 }
 catch(e)
 {
  alert(e);
 }
}

function guardarProducto(data)
{
	db = openDB();
	if(db)
	{
		max_id++;
		db.transaction(function(conex)
		{
			conex.executeSql('INSERT INTO productos VALUES(?,?,?)',[max_id, data.nombre, data.precio], 
			function(conex, result){
				//completado
			});
		});	
	}
}

function actualizarProducto(data){
	db = openDB();
	if(db)
	{		
		db.transaction(function(conex)
		{
			conex.executeSql('UPDATE productos set precio=? WHERE id=?',[data.precio, data.id], 
			function(conex, result){
				//alert("Producto guardado ("+result+")");
			});
		});	
	}	
}

function eliminarProducto(data){
	db = openDB();
	if(db)
	{		
		db.transaction(function(conex)
		{
			conex.executeSql('DELETE FROM productos WHERE id=?',[data.id], 
			function(conex, result){
				//alert("Producto guardado ("+result+")");
			});
		});	
	}	
}

function getProductos(){
 db = openDB();
  db.transaction(
	function (tx) {
		tx.executeSql('SELECT * FROM productos', [], 
		function (tx, results)
		{			
			  var len = results.rows.length;
			  for(var iter = 0; iter < len; iter++)
			  {
				var xitem = results.rows.item(iter);				
				//$("#productos").append('<option id="'+xitem["id"]+'" value="'+xitem["nombre"]+'" precio="'+xitem["precio"]+'">');
				$("#productos").append('<li id="'+xitem["id"]+'" precio="'+xitem["precio"]+'"><span class="product_name">'+xitem["nombre"]+'</span><span class="delete-item">-</span></li>');
			  }
		}
		);
	}
  );
}

var max_id=0;
function getMaxId(){
  db = openDB();  
  db.transaction(
	function (tx) {
		tx.executeSql('SELECT max(id) as id FROM productos', [], 
		function (tx, results)
		{
		  var row = results.rows.item(0);	
		  if(row['id']!=null)
		  	max_id = row['id'];		 
		}
		);
	}
  );
  console.log("ID maximo: " + max_id)
  return max_id;
}

function getProductId(){
	return max_id;
}

function getMyList(){
  db = openDB();  
  db.transaction(
	function (tx) {
		tx.executeSql('SELECT p.id, p.nombre, p.precio, ml.cantidad, ml.checked FROM productos p, mi_lista ml WHERE p.id=ml.id', [], 
		function (tx, results)
		{
		  try
		  {		  
		   var len = results.rows.length;
		   var bigtotal = 0;
			  for(var iter = 0; iter < len; iter++)
			  {
				var xitem = results.rows.item(iter);
				bigtotal += xitem["precio"] * xitem["cantidad"];
				showProducto({id:xitem["id"], descripcion:xitem["nombre"], precio:xitem["precio"], cantidad:xitem["cantidad"], checked:xitem["checked"]});
			  }
			$("#gran-total").val(bigtotal); 
			$("#total_items").text(len+" artículos") 
		   }catch(e){alert(e)}
		}
		);
	}
  );  
  return max_id;
}

function addToMyList(data){	
	if(data.id==0)
		data.id=max_id;
	db = openDB();
	if(db)
	{		
		db.transaction(function(conex)
		{
			conex.executeSql('INSERT INTO mi_lista values(?,?,?)',[data.id, data.cantidad, data.checked], 
			function(conex, result){
				//alert("Producto guardado ("+result+")");
			});
		});	
	}	
}

function updateFromMyList(data){
	db = openDB();
	if(db)
	{		
		db.transaction(function(conex)
		{
			if(data.cantidad!=-1)
			 conex.executeSql('UPDATE mi_lista SET cantidad=?, checked=? WHERE id=?', [data.cantidad, data.checked, data.id], 
			 function(conex, result){
				//alert("Producto guardado ("+result+")");
			 });
			else
			 conex.executeSql('UPDATE mi_lista SET checked=? WHERE id=?', [data.checked, data.id], 
			 function(conex, result){
				//alert("Producto guardado ("+result+")");
			 });			
		});	
	}	
}

function removeFromMyList(data){
	db = openDB();
	if(db)
	{
		db.transaction(function(conex)
		{
			conex.executeSql('DELETE FROM mi_lista WHERE id=?',[data.id], 
			function(conex, result){
				//alert("Producto guardado ("+result+")");
			});
		});	
	}	
}

function showProducto(data){
	var checkbox = "", ul_class="";
	
	if(data.checked=="true")
	{
	 checkbox = '<input type="checkbox" checked class="ui-checkbox">';
	 ul_class = 'class="checkeado"';
	}
	else
	  checkbox = '<input type="checkbox">';
	var datos = '<tr id="'+data.id+'" '+ul_class+'>'+					
						'<td class="descripcion">'+data.descripcion+'</td>'+
						'<td><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="number" size="4" name="precio" id="precio" value="'+data.precio+'"></div></td>'+
						'<td><div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="number" size="4" name="cant" id="cant" value="'+data.cantidad+'"></div></td>'+
						'<td id="total" style="text-align:center">'+parseFloat(data.precio*data.cantidad)+'</td>'+						
						'<td><div><div class="btn remove"></div></div></td>'+
				'</tr>';
	$("#mi_lista").append(datos);
}