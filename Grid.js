function Grid() {
    if (arguments.length >= 3) {

        if(arguments.length >= 4)
            this.Styling = arguments[3];

        arguments[2].forEach(function(col) {
        	this.Columns[col.Column] = col;
        }.bind(this));

        this.ContainerElement = document.getElementById(arguments[1]);
        this.GridBuilder(arguments[0]);
    }
}

Grid.prototype = {
    TableElement: undefined,
    ContainerElement: undefined,
    ModelMap: [],
    Columns: [],
    VisibleColumns: [],
    Styling: {Row: "",Cell: "",Header:"",Table: "", Delete: ""},
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

        if(FileName == undefined || FileName == null || FileName == "")
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
        var row = document.createElement("tr");
        row.className += this.Styling.Row;
        var newModel = {};

        for(var prop in this.Columns){
            if(this.Columns[prop].Visible) {
                newModel[prop] = (ModelValues[prop]) ? ModelValues[prop] : undefined;

                var td = document.createElement("td");
                td.className += this.Styling.Cell;

                var input_label = document.createElement("label");
                input_label.innerHTML = (newModel[prop])? newModel[prop] : "Please Insert Value..";
                input_label.id = prop; 

                td.appendChild(input_label);
                row.appendChild(td);
            }
            else if(!this.Columns[prop].Visible) {
                newModel[prop] = ModelValues[prop];
            }
        }

        var td = document.createElement("td");
        td.className += this.Styling.Cell;

        var del = document.createElement("input");
        del.type = "checkbox";
        del.className += this.Styling.Delete;

        row.appendChild(td);
        td.appendChild(del);

        var mapping = {
        	HTMLRow: row,
            Model: newModel,
            remove: false,
            DeleteElement: del,
            Styling: this.Styling.Cell
        };

        this.ModelMap.push(mapping);
        this.AddRowEvent(mapping);
        this.TableElement.appendChild(row);

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
        for (var col in this.Columns) {
            if (this.Columns[col].Visible) {
                var th = document.createElement("th");
                th.className += this.Styling.Header;
                th.appendChild(document.createTextNode(col));
                header.appendChild(th);
            }
        }
        var deleteHeader = document.createElement("th");
        deleteHeader.className += this.Styling.Header;
        deleteHeader.appendChild(document.createTextNode("Delete"));
        header.appendChild(deleteHeader);

        this.TableElement.appendChild(header);


        for (var x = 0; x < Model.length; x++) {
            var row = document.createElement("tr");
            row.className += this.Styling.Row;

            this.AddRow(Model[x]);
        }


        this.ContainerElement.appendChild(this.TableElement);
    },
    AddRowEvent: function(mapping) {
		mapping.HTMLRow.addEventListener("click",function(e) {
			if(!e.target.edit && this.DeleteElement != e.target && e.target.tagName.toLowerCase() == "label") {
				var input = document.createElement("input");
				input.type = "Text";
				input.value = e.target.innerText;
				input.name = e.target.id;
				input.setAttribute('edit',true);

				e.target.parentNode.replaceChild(input,e.target);
				input.focus();

				input.addEventListener("change", function(e) {
					this.Model[e.target.name] = e.target.value;
				}.bind(this));

				input.addEventListener("blur", function(e) {
					e.target.edit = false;

					var input_label = document.createElement("label");
					//input_label.className += this.Styling.Cell;
					input_label.innerHTML = e.target.value;
					input_label.id = e.target.id;

					e.target.parentNode.replaceChild(input_label,e.target);

				}.bind(this));
			}
		}.bind(mapping));

		mapping.DeleteElement.addEventListener("change", function (e) {
			this.remove = this.DeleteElement.checked ? true : false;
		}.bind(mapping));
    }
}

Grid.prototype.constructor = Grid;