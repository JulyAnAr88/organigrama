const conexionDP = require("../conexiones/conexionDatamartPentaho")
const conexionR = require("../conexiones/conexionRafam")
const fs = require('fs');

if (typeof localStorage === "undefined" || localStorage === null) {
    let LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const distanciaEntreCategorias = [25, 55, 70, 70, 70, 70, 70];
const distanciaEntreNodos = [35, 50, 45, 40, 35, 40, 40, 40];
const coordIniciales = [250, 50]

module.exports = {

    //Trae la db completa
    async obtener(fecha) {
        const resultados = await conexionDP.query(
            `select 
            case when dependencia = 'M' then 0 		--Municipalidad
            when dependencia = 'A' then 1			--Ente
            when dependencia = 'B' then 3			--Subsecretaría
            when dependencia = 'G' then 4			--Dirección ejecutiva
            when dependencia = 'L' then 5			--Dirección general
            when dependencia = 'D' then 6			--Dirección
            when dependencia = 'I' then 7			--Subdirección
            when dependencia = 'P' then 8			--Departamento
            when dependencia = 'C' then 9			--Sección
            else
             (case when dependencia = 'S' and numsecretaria <> 0 then 2
                else 1 end)					--Secretaría
            end as category, ve.id, fecha, codigo, numero, trim(nombre) as nombre
        from v_estructuracompleta ve
        left join 
            (select id,
            trim(coalesce (codseccion, coddepartamento, codsubdireccion, coddireccion, coddirecciongeneral, 
            coddireccionejecutiva, codsubsecretaria,codsecretaria, codente, codigo))
            as dependencia
            from v_estructuracompleta
            where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')
            ) target on target.id = ve.id
            where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')
        order by 1, 2`, [fecha]);
        return resultados.rows;
    },

    //Devuelve las filas que contengan ese campo
    async obtenerFila(fecha, campo) {
        key = "%" + campo + "%"

        const resultados = await conexionDP.query(
            `select 
            case when dependencia = 'M' then 0 		--Municipalidad
            when dependencia = 'A' then 1			--Ente
            when dependencia = 'B' then 3			--Subsecretaría
            when dependencia = 'L' then 4			--Dirección general
	        when dependencia = 'D' then 5			--Dirección
	        when dependencia = 'I' then 6			--Subdirección
	        when dependencia = 'P' then 7			--Departamento
	        when dependencia = 'C' then 8			--Sección
            else
             (case when dependencia = 'S' and numsecretaria <> 0 then 2
                else 1 end)					--Secretaría
            end as category, ve.id, fecha, codigo, numero, trim(nombre) as nombre
        from v_estructuracompleta ve
        left join 
            (select id,
            trim(coalesce (codseccion, coddepartamento, codsubdireccion, coddireccion, coddirecciongeneral, 
            coddireccionejecutiva, codsubsecretaria,codsecretaria, codente, codigo))
            as dependencia
            from v_estructuracompleta
            where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')
            ) target on target.id = ve.id
            where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')
            and
                                (ve.id like upper($2) or
                        nombre like upper($2) or
                        codigo like upper($2) or
                    cast(numero as varchar) like upper($2) or
                    nombre like upper($2) or
                    codente like upper($2) or
                    cast(numente as varchar) like upper($2) or
                    ente like upper($2) or
                    codsecretaria like upper($2) or
                    cast(numsecretaria as varchar) like upper($2) or
                    secretaria like upper($2) or
                    codsubsecretaria like upper($2) or
                    cast(numsubsecretaria as varchar) like upper($2) or
                    subsecretaria like upper($2) or
                    coddireccionejecutiva like upper($2) or
                    cast(numdireccionejecutiva as varchar) like upper($2) or
                    direccionejecutiva like upper($2) or
                    coddirecciongeneral like upper($2) or
                    cast(numdirecciongeneral as varchar) like upper($2) or
                    direcciongeneral like upper($2) or
                    coddireccion like upper($2) or
                    cast(numdireccion as varchar) like upper($2) or
                    direccion like upper($2) or
                    codsubdireccion like upper($2) or
                    cast(numsubdireccion as varchar) like upper($2) or
                    subdireccion like upper($2) or
                    coddepartamento like upper($2) or
                    cast(numdepartamento as varchar) like upper($2) or
                    departamento like upper($2) or
                    codseccion like upper($2) or
                    cast(numseccion as varchar) like upper($2) or
                    seccion like upper($2))
        order by 1`, [fecha, key]);
        return resultados.rows;
    },

    separarId(id) {
        let idSplit = []
        idSplit.push({
            "nro": id.substring(id.length - 4, id.length),
            "cod": id.charAt(6)
        })
        return idSplit
    },

    async obtenerCategorias() {
        const resultados = await conexionDP.query(`select 0 as orden,
        'MUNICIPALIDAD' as categorie
        union
            SELECT 
            case when ordinal_position = 8 then 1
            when ordinal_position = 11 then 2
            when ordinal_position = 14 then 3
            when ordinal_position = 23 then 4
            when ordinal_position = 26 then 5
            when ordinal_position = 29 then 6
            when ordinal_position = 32 then 7	
            end as orden,
            upper(column_name)
        FROM information_schema.columns     
        WHERE table_schema = 'public' and ordinal_position in (8,11,14,23,26,29,32)       
        AND table_name = 'v_estructuracompleta'
        order by 1`);
        return resultados.rows;
    },

    async buscarCategoria(fecha, id) {
        const resultados = await conexionDP.query(`select
        case when target = 'M' then 0 		--Municipalidad
        when target = 'A' then 1			--Ente
        when target = 'B' then 3			--Subsecretaría
        when target = 'D' then 4			--Dirección
        when target = 'I' then 5			--Subdirección
        when target = 'P' then 6			--Departamento
        when target = 'C' then 7			--Sección
        else
         (case when target = 'S' and numsecretaria <> 0 then 2
            else 1 end)					    --Secretaría
        end as categorie
    from v_estructuracompleta ve
    left join 
        (select id,
        trim(coalesce (codseccion, coddepartamento, codsubdireccion, coddireccion, coddirecciongeneral, 
            coddireccionejecutiva, codsubsecretaria,codsecretaria, codente, codigo))
        as target
        from v_estructuracompleta
        where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')
        ) target on target.id = ve.id
        where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD') and ve.id = $2
    order by 1`, [fecha, id]);
        let category = parseInt(JSON.stringify(resultados.rows[0]).charAt(13), 10);

        return category;
    },

    //Devuelve el id de padre de un código y número
    async obtenerRelacionPH(fecha, numero, codigo) {
        const fechaForId = fecha.substring(0, 4) + fecha.substring(5, 7)
        const resultados = await conexionR.query(
            `select ($1 ||trim(tiprepa) || trim(to_char(nrorepa, '0000'))) as target
            from rafam.tarepar t 
            where t.fecbaj is null 
            and t.tiprehi = $3 
            and t.nrorehi = $2 `,
            [fechaForId, numero, codigo]);
        return resultados.rows;
    },

    //Devuelve todos los hijos de un código y número
    async obtenerHijs(numero, codigo) {
        const resultados = await conexionR.query(
            `select fecini, tiprepa, nrorepa, trim(nbrepa) as nbrepa, tiprehi, nrorehi, 
            trim(nbrehi) as nbrehi, fecbaj,
            cast(ROW_NUMBER () OVER (	
                PARTITION  by t.nrorepa ORDER BY 1)as varchar) as grupo
                from rafam.tarepar t 
                where t.fecbaj is null 
                and t.nrorepa = $1 
                and t.tiprepa = $2
                order by 1`,
            [numero, codigo]);
        return resultados.rows;
    },

    //Busca primero el padre del id para devolver todas sus dependencias hijas
    async obtenerHermans(id) {

        const idSeparado = await this.separarId(id)

        const xadre = await conexionR.query(
            `select * from tarepar t 
            where t.fecbaj is null 
            and t.nrorehi = $1 
            and t.tiprehi = $2 `,
            [idSeparado.nro, idSeparado.cod]);

        const hermans = await obtenerHijs(xadre.rows[0].nrorepa, xadre.rows[0].tiprepa)

        return hermans.rows;
    },

    asignarSize(categorie) {
        let size = null;
        switch (categorie) {
            case 8:
                size = 11;
                break;
            case 7:
                size = 13;
                break;
            case 6:
                size = 14;
                break;
            case 5:
                size = 15;
                break;
            case 4:
                size = 16;
                break;
            case 3:
                size = 17;
                break;
            case 2:
                size = 18;
                break;
            case 1:
                size = 19;
                break;
            case 0:
                size = 23;
                break;
            default:
                break;
        }
        return size;
    },

    async cantidadPorCategoria(fecha, categoria) {
        let cat;
        let cantidad;
        switch (categoria) {
            case 8:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct seccion
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 7:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct departamento
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 6:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct subdireccion
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 5:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct direccion
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 4:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct direcciongeneral
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 3:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct subsecretaria
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 2:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct secretaria
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 1:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct ente
                from v_estructuracompleta ve
                where fecha = to_date(regexp_replace($1,'(.*)-(.*)-(.*)','\\1-\\2-01')::text,'YYYY-MM-DD')) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            default:
                break;
        }

        return cantidad;
    },

    async asignarY(categoria, x, centroY) {

        switch (categoria) {
            case 0:
                return 150;
                break;
            case 1:
                return parseFloat(((-1 / 300) * Math.pow(x - centroY, 2) + 270).toFixed(2))
                break;
            case 2:
                return parseFloat(((-1 / 500) * Math.pow(x - centroY, 2) + 350).toFixed(2))
                break;
            case 3:
                return parseFloat(((-1 / 800) * Math.pow(x - centroY, 2) + 430).toFixed(2))
                break;
            case 4:
                return parseFloat(((-1 / 1150) * Math.pow(x - centroY, 2) + 510).toFixed(2))
                break;
            case 5:
                return parseFloat(((-1 / 1400) * Math.pow(x - centroY, 2) + 590).toFixed(2))
                break;
            case 6:
                return parseFloat(((-1 / 1650) * Math.pow(x - centroY, 2) + 670).toFixed(2))
                break;
            case 7:
                return parseFloat(((-1 / 1800) * Math.pow(x - centroY, 2) + 730).toFixed(2))
                break;
            case 8:
                return parseFloat(((-1 / 2100) * Math.pow(x - centroY, 2) + 800).toFixed(2))
                break;
            /*  case 3:
            return (-1 / 1700) * Math.pow(x - centroY, 2) + 430
            break;
        case 4:
            return (-1 / 2400) * Math.pow(x - centroY, 2) + 510
            break;
        case 5:
            return (-1 / 3100) * Math.pow(x - centroY, 2) + 590
            break;
        case 6:
            return (-1 / 3800) * Math.pow(x - centroY, 2) + 670
            break;
        case 7:
            return (50 * Math.pow(Math.cos((x - centroY) / 200)), 2) + 730
            break;
        case 8:
            return (50 * Math.pow(Math.sin(x)), 2) * ((x - centroY) / 200) + 850
            break; */
            default:
                break;
        }
    },


    async armarRama(fecha, idPadre) {
        const fechaForId = fecha.substring(0, 4) + fecha.substring(5, 7)
        let nodo = []
        let nodoPadre = []
        let rama = {}
        let o

        console.log("id " + idPadre)

        //Busco tods ls hijs del id
        const idSeparado = this.separarId(idPadre)
        const hijs = await this.obtenerHijs(idSeparado[0].nro, idSeparado[0].cod)

        if (hijs != 0) {

            let nodoMuni = fechaForId + 'M0001'

            if (idPadre == nodoMuni) {
                let muni = (await this.obtenerFila(fecha, nodoMuni))
                let name = muni[0].nombre
                let categor = muni[0].category
                nodo.push({
                    "id": nodoMuni,
                    "name": name,
                    "category": categor,
                    "x": coordIniciales[0],
                    "y": coordIniciales[1],
                    "symbolSize": this.asignarSize(0)
                });
                o = nodo[0].x + 50
            } else {
                nodoPadre.push(this.buscarNodo(idPadre))
                o = nodoPadre[0].x + 50
            }

            //Guardo en un array las categorías de ls hijs
            let catHijs = []
            let categorias = []
            for (let index = 0; index < hijs.length; index++) {
                let nroId = "0".repeat(4 - hijs[index].nrorehi.toString().length) + hijs[index].nrorehi.toString()
                let idHij = fechaForId + hijs[index].tiprehi + nroId
                const categoria = await this.buscarCategoria(fecha, idHij)
                categorias.push(categoria)
                catHijs.push({
                    "id": idHij,
                    "cat": categoria
                })
            }

            //Defino el rango de x según la cantidad de hijs con centro en la ubicación del padre

            let rango = distanciaEntreNodos[this.menorMasRepetido(categorias)] * hijs.length
            let rangoCentrado = [o - rango / 2, o + rango / 2]

            //Asigna coordenadas a ls hijs
            let j = 0
            let i = rangoCentrado[0]
            let paso = distanciaEntreNodos[this.menorMasRepetido(categorias)]
            for (i; i < rangoCentrado[1]; i += paso) {
                let coordY = await this.asignarY(catHijs[j].cat, i, o)
                let size = this.asignarSize(catHijs[j].cat)
                let category = await this.buscarCategoria(fecha, catHijs[j].id)
                nodo.push({
                    "id": catHijs[j].id,
                    "name": hijs[j].nbrehi,
                    "category": category,
                    "x": i,
                    "y": coordY,
                    "symbolSize": size
                })
                j++
            }

            if (localStorage.length != 0) {
                rama = localStorage.getItem('rama')
            }

            if (!JSON.stringify(rama).includes(nodo[0].id)) {
                if (!rama.length) {

                    rama.nodes = nodo
                    localStorage.setItem('rama', JSON.stringify(rama));

                } else {
                    let nodoNew = []
                    JSON.parse(rama).nodes.forEach(element => {
                        nodoNew.push(element)
                    });

                    localStorage.clear()

                    nodo.forEach(element => {
                        nodoNew.push(element)
                    });
                    rama = {}

                    rama.nodes = nodoNew

                    localStorage.setItem('rama', JSON.stringify(rama));

                }

            } else {
                return
            }

        }
    },

    buscarNodo(id) {
        let rama = JSON.parse(localStorage.getItem('rama'))
        let nodo = []
        rama.nodes.forEach(element => {
            if (element.id == id) {
                nodo = element
            }
        });
        return nodo
    },

    async distanciaEntreNodos(id) {

        let categoria = await this.buscarCategoria(id)

        switch (categoria) {
            case 1:
                return distanciaEntreNodos[0]
                break;
            case 2:
                return distanciaEntreNodos[1]
                break;
            case 3:
                return distanciaEntreNodos[2]
                break;
            case 4:
                return distanciaEntreNodos[3]
                break;
            case 5:
                return distanciaEntreNodos[4]
                break;
            case 6:
                return distanciaEntreNodos[5]
                break;
            case 7:
                return distanciaEntreNodos[6]
                break;
            default:
                break;
        }
    },

    async rangoXHijosPorCategoria(fecha, id) {
        rangoCategoria
        let categoria = await this.buscarCategoria(fecha, id)
        switch (categoria) {
            case 8:




                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct seccion
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 7:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct departamento
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 6:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct subdireccion
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 5:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct direccion
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 4:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct direcciongeneral
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 3:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct subsecretaria
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 2:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct secretaria
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            case 1:
                resultados = await conexionDP.query(
                    `select count(*)
                from (select distinct ente
                from v_estructuracompleta ve
                where fecha = $1) as secretaria`, [fecha]);
                cantidad = resultados.rows[0]
                break;
            default:
                break;
        }
    },

    async crearJSON(fecha) {
        const nodes = [];
        const links = [];
        const categories = [];
        const yeison = {}

        const dependencias = await this.obtener(fecha);
        const categorias = await this.obtenerCategorias();


        //await this.armarRama(fecha, "202308A0010")


        //console.log(fecha)
        let categoria = await this.buscarCategoria(fecha, dependencias[i].id)
        let coordenadas = await this.asignarCoordenadas(fecha, dependencias[i].id)
        await this.obtenerHermans(dependencias[i].id)
        for (let i = 0; i < dependencias.length; i++) {
            await this.armarRama(fecha, dependencias[i].id)

        }

        let rama = JSON.parse(localStorage.getItem('rama'))

        rama.nodes.forEach(element => {
            nodes.push({
                "id": element.id,
                "name": element.name,
                "category": element.category,
                "x": element.x,
                "y": element.y,
                "symbolSize": element.symbolSize
            });

        });

        for (let i = 0; i < dependencias.length; i++) {
            let target = await this.obtenerRelacionPH(fecha, dependencias[i].numero, dependencias[i].codigo);
            links.push({
                "source": dependencias[i].id,
                "target": JSON.stringify(target).substring(12, 23)
            })
        }
        for (let i = 0; i < categorias.length; i++) {
            categories.push({
                "name": categorias[i].categorie
            })
        }



        yeison.nodes = nodes;
        yeison.links = links;
        yeison.categories = categories;

        localStorage.clear()

        return yeison;
    },

    async filtrarJSON(categorias) {
        //console.log(categorias)

        const nodosFiltrados = []
        const categoriasFiltradas = []
        const yeisonFiltrado = {}

        const categoriasReales = await this.obtenerCategorias();

        let organigrama = JSON.parse(fs.readFileSync('./public/json/organigrama.json', 'utf-8'))

        categorias.filtrados.forEach(nroCategoria => {


            organigrama.nodes.forEach(nodo => {
                if (nodo.category == nroCategoria) {
                    nodosFiltrados.push(nodo)
                }
            }
            )

            for (let i = 0; i < categoriasReales.length; i++) {

                if (categoriasReales[i].orden == nroCategoria) {
                    categoriasFiltradas.push({
                        "name": categoriasReales[i].categorie
                    })
                }
            }

        });

        yeisonFiltrado.nodes = nodosFiltrados
        yeisonFiltrado.links = organigrama.links
        yeisonFiltrado.categories = categoriasFiltradas

        return yeisonFiltrado
    },

    menorMasRepetido(array) {

        let cont = {}
        let nums = {}
        let min = 0

        if (Object.keys(array).length == 1) {

            min = array[0]
            nums[min] = min

            return nums[min]
        } else {
            array.sort().forEach(i => {
                cont[i] == null ? cont[i] = 1 :
                    ++cont[i] > min ? [min, nums[min]] = [cont[i], [i]] :
                        cont[i] == min ? nums[min].push(i) : 0

            })

            if (Object.keys(nums).length == 0) {
                min = 9
                for (let i in cont) {
                    if (i < min) {
                        min = i
                    }
                }

                nums[min] = min
            }
            //console.log("sale " + nums[min][0])

        }
        return nums[min][0]
    },

}