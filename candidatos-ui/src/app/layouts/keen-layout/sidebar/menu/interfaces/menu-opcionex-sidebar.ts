
////// ARMAR EL MENU EN EL ORDEN QUE APARECERA EN EL SIDEBAR ////////////

import { Role } from "../../../../../auth/enums/rol.enum"


export const menuPrincipal = {
    etiquetaDespliegue:'Candidatos',

    opcionSimple: {
        titulo: 'Recepcion',
        icono:  "bi bi-briefcase-fill", 
        url: "/dashboard/recepcion",
        roles: [Role.Admin, Role.Usuario],
    },

    opcionSimple2: {
        titulo: 'Acta de entrega',
        icono:  "bi bi-briefcase-fill", 
        url: "/dashboard/acta-recepcion",
        roles: [Role.Admin, Role.Usuario],
    },


    menuPrimerNivel: [
        {
            titulo: 'Configuracion',
            icono: "bi bi-gear-fill",
            url: "/dashboard/configuracion",
            roles: [Role.Admin, Role.Usuario],
            opcionSimple: [
                {
                    titulo: 'Importar Reporte Candidatos',
                    url: "/dashboard/configuracion/importar"
                },
                {
                    titulo: 'Configurar sistema',
                    url: "/dashboard/configuracion/parametros"
                },
            ]

        }
    ],
}

export const menuDeOpcionesDos = {

    etiquetaSistema:'Sistema',
    
    opcionSimple: {
            titulo: 'Acerca de',
            icono:  "bi bi-briefcase-fill", 
            url: "/dashboard/about",
            roles: [Role.Admin, Role.Usuario],
    },

}


/*
export const menuDeOpcionesUno = {

    etiquetaDespliegue:'Contrataciones',
 
    menuPrimerNivel: [
        {
            titulo: 'Proceso de Contratacion',
            icono: "bi bi-check2-square",
            url: "/dashboard/procesos",
            roles: [Role.Admin, Role.Usuario],
            opcionSimple: [
                {
                    titulo: 'Lista de Procesos',
                    url: "/dashboard/procesos/profile",
                },
                {
                    titulo: 'Cotizaciones',
                    url: "/dashboard/procesos/cotizacion"
                },
                // {
                //     titulo: 'Seguimiento Recinto',
                //     url: "/dashboard/despliegue/seguimientorecinto"
                // },
                // {
                //     titulo: 'Seguimiento Tecnicos',
                //     url: "/dashboard/despliegue/seguimientotecnico"
                // },
            ]
        },
        {
            titulo: 'Plan Operativo',
            icono: "bi bi-diagram-3 ",
            url: "/dashboard/plan",
            roles: [Role.Admin, Role.Usuario],
            opcionSimple: [
                {
                    titulo: 'Ver Plan Operativo',
                    url: "/dashboard/plan/ver",
                },
                {
                    titulo: 'Cotizaciones',
                    url: "/dashboard/plan/saldos"
                },
            ]
        },
        {
            titulo: 'Configuracion',
            icono: "bi bi-gear-fill",
            url: "/dashboard/config",
            roles: [Role.Admin],
            opcionSimple: [
                {
                    titulo: 'Importar Plan Operativo',
                    url: "/dashboard/config/importarplan"
                },
                {
                    titulo: 'Plan Operativo y RPA',
                    url: "/dashboard/config/planoperativo"
                },
            ]

        }
    ],
}
*/
