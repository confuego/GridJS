function Grid() {
    if (arguments.length >= 3) {
        
        if(arguments.length >= 4)
            this.Styling = arguments[3];

        arguments[2].forEach(function(col) {
        	this.Columns[col.Column] = col;
        }.bind(this));

        this.DIV = document.getElementById(arguments[1]);
        this.GridBuilder(arguments[0]);
    }
}

Grid.prototype = {
    TableElement: undefined,
    DIV: undefined,
    ModelMap: [],
    Columns: [{Column: undefined, Visible: undefined}],
    VisibleColumns: [],
    Styling: {Row: "",Input: "",Header:"",Table: "", CheckBox: ""},
    Model: function(){
        var ModelArray = [];
        this.ModelMap.forEach(function(val){
            ModelArray.push(val.Model);
        });
        return ModelArray; 
    },
    Download:function(FileName) {
        var models = this.Model();
        var CSV = "";

        if(FileName.value == undefined || FileName.value == null || FileName.value == "")
            FileName = "Grid.csv";

        for(col in this.Columns) {
            if(this.Columns[col].Visible)
                CSV += (col + ",");
        }
        CSV = CSV.substring(0,CSV.length -1);
        CSV += "\r\n";


        for (var idx = 0; idx < models.length; idx++) {

            for (prop in models[idx]) {
                if(this.Columns[prop].Visible)
                    CSV += models[idx][prop] + ",";
            }
            CSV = CSV.substring(0, CSV.length - 1);
            CSV += "\r\n";
        }

        var download = document.createElement('a');
        download.setAttribute('href', window.URL.createObjectURL(new Blob([CSV], {type: 'text/csv'})));
        download.setAttribute('download', FileName);
        download.style.display = 'none';
        document.body.appendChild(download);
        download.click();
        document.body.removeChild(download);
    },
    Import: function(file) {
        if(window.FileReader) {
        	var reader = new FileReader();

            if(file[0] == null || file[0] == undefined || file[0] == "") {
                    return;
            }

        	reader.readAsText(file[0]);

        	reader.onload = function (e) {
				var csv = e.target.result;
				var allTextLines = csv.split(/\r\n|\n/);
				var txt_columns = allTextLines[0].split(',');

                for(var col = 0; col < txt_columns.length; col++) {
                	if(this.Columns[txt_columns[col].trim()] == undefined) {
                		alert("Column in CSV does not exist in model!");
                		return;
                	}
                }

				for (var i=1; i<allTextLines.length; i++) {

					var data = allTextLines[i].split(',');

					if (data != "") {
						var KVP = {};
						var data_count = 0;

						txt_columns.forEach(function(colName) {
							KVP[colName] =  data[data_count].trim();
							data_count++;
						});

						this.AddRow(KVP);
					}

				}
        	}.bind(this);

        	reader.onerror = function (e){
        		if(e.target.error.name == "NotReadableError") {
        			alert('Cannot Read File');
        		}
        	};
        }
        else {
        	alert('FileReader not supported');
        }
    },
    AddRow: function() {
    	var ModelValues = [];

    	if(arguments.length >= 1) {
    		ModelValues = arguments[0];
    	}
        var tr = document.createElement("tr");
        var newModel = {};

        for(var prop in this.Columns){
            if(this.Columns[prop].Visible) {
                newModel[prop] = (ModelValues[prop] != undefined) ? ModelValues[prop] : undefined;

                var td = document.createElement("td");

                var input = document.createElement("input");
                input.type = "Text";
                input.value = (newModel[prop] != undefined)? newModel[prop] : "";
                input.name = prop;
                input.className += this.Styling.Input;

                td.appendChild(input);
                tr.appendChild(td);
            }
            else if(!this.Columns[prop].Visible) {
                newModel[prop] = undefined;
            }
        }

        var td = document.createElement("td");

        var del = document.createElement("input");
        del.type = "checkbox";
        del.className += this.Styling.CheckBox;

        td.appendChild(del);
        tr.appendChild(td);

        var mapping = {
            HTMLRow: tr,
            Model: newModel,
            remove: false,
            DeleteElement: del
        };

        this.ModelMap.push(mapping);

        tr.addEventListener("change", function (e) {
        	var model = this.Model;
                
            if(e.target == this.DeleteElement) {
                this.remove = this.DeleteElement.checked ? true : false;
            }
            else
                this.Model[e.target.name] = e.target.value;
        }.bind(mapping));

        this.TableElement.appendChild(tr);
    },
    Refresh: function () {

        for(var m = 0; m < this.ModelMap.length; m++){
            var change = this.ModelMap[m];

            if (change.remove == true) {
                change.HTMLRow.parentNode.removeChild(change.HTMLRow);
                this.ModelMap.splice(m, 1);
                m--;
            }
        }
    },
    GridBuilder: function (Model) {

        this.TableElement = document.createElement("table");
        this.TableElement.className += this.Styling.Table;

        var header = document.createElement("tr");
        var cell_count = 0;
        for (var col in this.Columns) {
            if (this.Columns[col].Visible) {
                var th = document.createElement("th");
                th.className += this.Styling.Header;
                header.appendChild(th);
                header.cells[cell_count].appendChild(document.createTextNode(col));
                cell_count++;
            }
        }
        var deleteHeader = document.createElement("th");
        deleteHeader.className += this.Styling.Header;
        header.appendChild(deleteHeader);

        header.cells[cell_count].appendChild(document.createTextNode("Delete"));

        this.TableElement.appendChild(header);


        for (var x = 0; x < Model.length; x++) {
            var row = document.createElement("tr");
            row.className += this.Styling.Row;
            var cell_count = 0;

            for (var col in this.Columns) {

                if (this.Columns[col].Visible) {
                    var td = document.createElement("td");
                    row.appendChild(td);

                    var input = document.createElement("input");
                    input.className += this.Styling.Input;
                    input.value = Model[x][col];
                    input.type = "Text";
                    input.name = col;

                    row.cells[cell_count].appendChild(input);
                    cell_count++;
                }
            }

            var del = document.createElement("input");
            del.className += this.Styling.CheckBox;
            del.type = "checkbox";

            row.appendChild(document.createElement("td"));
            row.cells[cell_count].appendChild(del);

            var mapping = {
                HTMLRow: row,
                Model: Model[x],
                remove: false,
                DeleteElement: del,
            };

            this.ModelMap.push(mapping);

            this.TableElement.appendChild(row);

            row.addEventListener("change", function (e) {
                var model = this.Model;
                
                if(e.target == this.DeleteElement) {
                	this.remove = this.DeleteElement.checked ? true : false;
                }
                else
                	this.Model[e.target.name] = e.target.value;

                
            }.bind(mapping));
        }

        this.DIV.appendChild(this.TableElement);
    }
}

Grid.prototype.constructor = Grid;