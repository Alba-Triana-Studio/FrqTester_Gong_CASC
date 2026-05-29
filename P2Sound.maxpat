{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 2,
            "revision": 1,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [
            -1.0,
            127.0,
            648.0,
            684.0
        ],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [
            15.0,
            15.0
        ],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 200,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 0.0,
        "description": "",
        "digest": "",
        "tags": "",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        194.0,
                        175.0,
                        73.0,
                        22.0
                    ],
                    "text": "r setphase0"
                }
            },
            {
                "box": {
                    "fontname": "Verdana",
                    "fontsize": 12.0,
                    "format": 6,
                    "id": "obj-14",
                    "maxclass": "flonum",
                    "maximum": 1.0,
                    "minimum": 0.0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        194.0,
                        220.0,
                        50.0,
                        23.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-48",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        428.0,
                        66.0,
                        87.0,
                        33.0
                    ],
                    "text": "phase shift (degrees)"
                }
            },
            {
                "box": {
                    "id": "obj-50",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [
                        "bang"
                    ],
                    "patching_rect": [
                        475.0,
                        225.0,
                        24.0,
                        22.0
                    ],
                    "text": "t b"
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        453.0,
                        276.0,
                        72.0,
                        22.0
                    ],
                    "text": "184.444444"
                }
            },
            {
                "box": {
                    "id": "obj-47",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "float"
                    ],
                    "patching_rect": [
                        418.0,
                        235.0,
                        29.5,
                        22.0
                    ],
                    "text": "* 1."
                }
            },
            {
                "box": {
                    "id": "obj-46",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "float"
                    ],
                    "patching_rect": [
                        418.0,
                        187.0,
                        41.0,
                        22.0
                    ],
                    "text": "/ 360."
                }
            },
            {
                "box": {
                    "id": "obj-39",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "float"
                    ],
                    "patching_rect": [
                        418.0,
                        147.0,
                        90.666664,
                        22.0
                    ],
                    "text": "* 1."
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "float"
                    ],
                    "patching_rect": [
                        418.0,
                        107.0,
                        31.0,
                        22.0
                    ],
                    "text": "!/ 1."
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 4,
                    "outlettype": [
                        "int",
                        "float",
                        "int",
                        "int"
                    ],
                    "patching_rect": [
                        475.0,
                        107.0,
                        63.0,
                        22.0
                    ],
                    "text": "dspstate~"
                }
            },
            {
                "box": {
                    "id": "obj-35",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        538.0,
                        187.0,
                        87.0,
                        20.0
                    ],
                    "text": "shift (degrees)"
                }
            },
            {
                "box": {
                    "bgcolor": [
                        0.418887,
                        0.0,
                        0.934623,
                        1.0
                    ],
                    "format": 6,
                    "id": "obj-37",
                    "maxclass": "flonum",
                    "maximum": 360.0,
                    "minimum": 0.0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        475.0,
                        187.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-40",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        312.0,
                        389.0,
                        81.0,
                        22.0
                    ],
                    "text": "delay~ 48000"
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        542.875,
                        147.0,
                        55.0,
                        22.0
                    ],
                    "text": "r phase2"
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-24",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        318.0,
                        642.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        380.0,
                        579.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "bgcolor": [
                        0.94,
                        0.94,
                        0.94,
                        1.0
                    ],
                    "id": "obj-212",
                    "markercolor": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "markers": [
                        -60,
                        -48,
                        -36,
                        -24,
                        -12,
                        -6,
                        0,
                        6
                    ],
                    "markersused": 8,
                    "maxclass": "levelmeter~",
                    "needlecolor": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        415.0,
                        682.0,
                        128.0,
                        64.0
                    ],
                    "presentation": 1,
                    "presentation_rect": [
                        1591.15332,
                        468.787201,
                        289.52301,
                        144.761505
                    ]
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 13.0,
                    "id": "obj-8",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        84.375,
                        237.0,
                        36.0,
                        23.0
                    ],
                    "text": "0 20"
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-4",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        194.0,
                        98.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 13.0,
                    "id": "obj-3",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        38.375,
                        97.0,
                        45.0,
                        23.0
                    ],
                    "text": "$1 20"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 13.0,
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [
                        "signal",
                        "bang"
                    ],
                    "patching_rect": [
                        84.375,
                        273.0,
                        38.0,
                        23.0
                    ],
                    "text": "line~"
                }
            },
            {
                "box": {
                    "fontname": "Verdana",
                    "fontsize": 12.0,
                    "id": "obj-23",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        38.375,
                        371.0,
                        64.0,
                        23.0
                    ],
                    "text": "phasor~"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-21",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        304.0,
                        509.0,
                        53.0,
                        22.0
                    ],
                    "text": "r divider"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-19",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "bang",
                        "float"
                    ],
                    "patching_rect": [
                        304.0,
                        576.0,
                        32.5,
                        22.0
                    ],
                    "text": "t b f"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-17",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        38.375,
                        709.0,
                        32.5,
                        22.0
                    ],
                    "text": "*~"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-5",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        152.375,
                        450.0,
                        50.0,
                        19.0
                    ],
                    "text": "Volume"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-9",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        194.375,
                        661.0,
                        92.0,
                        19.0
                    ],
                    "text": "Amplitude in dB"
                }
            },
            {
                "box": {
                    "bgcolor": [
                        0.866667,
                        0.866667,
                        0.866667,
                        1.0
                    ],
                    "cantchange": 1,
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "format": 6,
                    "htricolor": [
                        0.87,
                        0.82,
                        0.24,
                        1.0
                    ],
                    "id": "obj-25",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        194.375,
                        637.0,
                        66.0,
                        21.0
                    ],
                    "textcolor": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "triangle": 0,
                    "tricolor": [
                        0.75,
                        0.75,
                        0.75,
                        1.0
                    ],
                    "triscale": 0.9
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-12",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        194.375,
                        614.0,
                        42.0,
                        21.0
                    ],
                    "text": "AtodB"
                }
            },
            {
                "box": {
                    "bgcolor": [
                        0.866667,
                        0.866667,
                        0.866667,
                        1.0
                    ],
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "format": 6,
                    "htricolor": [
                        0.87,
                        0.82,
                        0.24,
                        1.0
                    ],
                    "id": "obj-29",
                    "maxclass": "flonum",
                    "maximum": 1.0,
                    "minimum": 0.0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [
                        "",
                        "bang"
                    ],
                    "parameter_enable": 0,
                    "patching_rect": [
                        152.375,
                        560.0,
                        68.0,
                        21.0
                    ],
                    "textcolor": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "tricolor": [
                        0.75,
                        0.75,
                        0.75,
                        1.0
                    ],
                    "triscale": 0.9
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-30",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [
                        "signal",
                        "bang"
                    ],
                    "patching_rect": [
                        152.375,
                        661.0,
                        35.0,
                        21.0
                    ],
                    "text": "line~"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-16",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        152.375,
                        637.0,
                        40.0,
                        21.0
                    ],
                    "text": "$1 50"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.595187,
                    "id": "obj-34",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "float"
                    ],
                    "patching_rect": [
                        152.375,
                        614.0,
                        34.0,
                        21.0
                    ],
                    "text": "* 0.5"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        84.375,
                        200.0,
                        73.0,
                        22.0
                    ],
                    "text": "r setphase0"
                }
            },
            {
                "box": {
                    "fontname": "Verdana",
                    "fontsize": 12.0,
                    "id": "obj-18",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        141.875,
                        284.0,
                        71.0,
                        21.0
                    ],
                    "text": "phase 0-1"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-26",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        91.375,
                        31.5,
                        239.0,
                        24.0
                    ],
                    "text": "Valor de la frecuencia desde la interfaz"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        152.375,
                        474.0,
                        40.0,
                        22.0
                    ],
                    "text": "r vol2"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-1",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        38.375,
                        39.0,
                        52.0,
                        22.0
                    ],
                    "text": "r p2freq"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 13.0,
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [
                        "signal",
                        "bang"
                    ],
                    "patching_rect": [
                        38.375,
                        148.0,
                        38.0,
                        23.0
                    ],
                    "text": "line~"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 12.0,
                    "id": "obj-178",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        38.375,
                        15.0,
                        47.0,
                        20.0
                    ],
                    "text": "Pitch"
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-173",
                    "index": 1,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [
                        38.375,
                        780.0,
                        25.0,
                        25.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        -18.0,
                        455.0,
                        42.0,
                        22.0
                    ],
                    "text": "r PW2"
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        -18.0,
                        485.0,
                        42.0,
                        22.0
                    ],
                    "text": "sig~"
                }
            },
            {
                "box": {
                    "id": "obj-gen-dscale-510",
                    "maxclass": "newobj",
                    "text": "*~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        100.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-dsafe-829",
                    "maxclass": "newobj",
                    "text": "maximum~ 0.0001",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        125.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-plt-821",
                    "maxclass": "newobj",
                    "text": "<~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        150.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-nge-775",
                    "maxclass": "newobj",
                    "text": ">=~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        175.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-nadd-796",
                    "maxclass": "newobj",
                    "text": "+~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        200.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-nlt-914",
                    "maxclass": "newobj",
                    "text": "<~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        225.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-nand-847",
                    "maxclass": "newobj",
                    "text": "*~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        250.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-spdiv-355",
                    "maxclass": "newobj",
                    "text": "/~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        275.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-spmul-103",
                    "maxclass": "newobj",
                    "text": "*~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        300.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-spcyc-291",
                    "maxclass": "newobj",
                    "text": "cycle~ 0",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        325.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-spmask-774",
                    "maxclass": "newobj",
                    "text": "*~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        350.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-snsub-885",
                    "maxclass": "newobj",
                    "text": "-~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        375.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-sndiv-275",
                    "maxclass": "newobj",
                    "text": "/~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        400.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-snmul-849",
                    "maxclass": "newobj",
                    "text": "*~ 0.5",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        425.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-sncyc-211",
                    "maxclass": "newobj",
                    "text": "cycle~ 0",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        450.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-snmask-450",
                    "maxclass": "newobj",
                    "text": "*~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        475.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-wr-895",
                    "maxclass": "newobj",
                    "text": "r waveform_type",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [
                        ""
                    ],
                    "patching_rect": [
                        100.0,
                        500.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-wadd-871",
                    "maxclass": "newobj",
                    "text": "+ 1",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "int"
                    ],
                    "patching_rect": [
                        100.0,
                        525.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-wsig-861",
                    "maxclass": "newobj",
                    "text": "sig~",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        550.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-selp-856",
                    "maxclass": "newobj",
                    "text": "selector~ 3",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        575.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-seln-198",
                    "maxclass": "newobj",
                    "text": "selector~ 3",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        600.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-outsub-587",
                    "maxclass": "newobj",
                    "text": "-~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        625.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-spadd-135",
                    "maxclass": "newobj",
                    "text": "+~ 0.75",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        300.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-gen-snadd-177",
                    "maxclass": "newobj",
                    "text": "+~ 0.75",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [
                        "signal"
                    ],
                    "patching_rect": [
                        100.0,
                        300.0,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "+~ 0.5",
                    "id": "damp-pos-add",
                    "patching_rect": [
                        200,
                        200,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "cycle~ 0",
                    "id": "damp-pos-cyc",
                    "patching_rect": [
                        200,
                        230,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "*~ 0.5",
                    "id": "damp-pos-mul",
                    "patching_rect": [
                        200,
                        260,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "+~ 0.5",
                    "id": "damp-pos-add2",
                    "patching_rect": [
                        200,
                        290,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "*~",
                    "id": "damp-pos-mask",
                    "patching_rect": [
                        200,
                        320,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "+~ 0.5",
                    "id": "damp-neg-add",
                    "patching_rect": [
                        300,
                        200,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "cycle~ 0",
                    "id": "damp-neg-cyc",
                    "patching_rect": [
                        300,
                        230,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "*~ 0.5",
                    "id": "damp-neg-mul",
                    "patching_rect": [
                        300,
                        260,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "+~ 0.5",
                    "id": "damp-neg-add2",
                    "patching_rect": [
                        300,
                        290,
                        50.0,
                        22.0
                    ]
                }
            },
            {
                "box": {
                    "maxclass": "newobj",
                    "text": "*~",
                    "id": "damp-neg-mask",
                    "patching_rect": [
                        300,
                        320,
                        50.0,
                        22.0
                    ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [
                        "obj-3",
                        0
                    ],
                    "order": 1,
                    "source": [
                        "obj-1",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-4",
                        0
                    ],
                    "order": 0,
                    "source": [
                        "obj-1",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "color": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "destination": [
                        "obj-25",
                        0
                    ],
                    "source": [
                        "obj-12",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-8",
                        0
                    ],
                    "source": [
                        "obj-13",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-23",
                        1
                    ],
                    "source": [
                        "obj-14",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "color": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "destination": [
                        "obj-30",
                        0
                    ],
                    "source": [
                        "obj-16",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-34",
                        1
                    ],
                    "midpoints": [
                        327.0,
                        607.0,
                        247.0,
                        607.0,
                        247.0,
                        607.0,
                        176.875,
                        607.0
                    ],
                    "source": [
                        "obj-19",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-34",
                        0
                    ],
                    "midpoints": [
                        313.5,
                        607.0,
                        161.875,
                        607.0
                    ],
                    "source": [
                        "obj-19",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-14",
                        0
                    ],
                    "source": [
                        "obj-2",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-10",
                        0
                    ],
                    "source": [
                        "obj-21",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-37",
                        0
                    ],
                    "source": [
                        "obj-28",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "color": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "destination": [
                        "obj-12",
                        0
                    ],
                    "midpoints": [
                        161.875,
                        604.0,
                        203.875,
                        604.0
                    ],
                    "order": 0,
                    "source": [
                        "obj-29",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "color": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "destination": [
                        "obj-34",
                        0
                    ],
                    "order": 1,
                    "source": [
                        "obj-29",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-6",
                        0
                    ],
                    "midpoints": [
                        47.875,
                        145.0
                    ],
                    "source": [
                        "obj-3",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-17",
                        1
                    ],
                    "midpoints": [
                        161.875,
                        694.0,
                        61.375,
                        694.0
                    ],
                    "order": 1,
                    "source": [
                        "obj-30",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-212",
                        0
                    ],
                    "order": 0,
                    "source": [
                        "obj-30",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-39",
                        1
                    ],
                    "source": [
                        "obj-33",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "color": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                    ],
                    "destination": [
                        "obj-16",
                        0
                    ],
                    "order": 1,
                    "source": [
                        "obj-34",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-24",
                        0
                    ],
                    "order": 0,
                    "source": [
                        "obj-34",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-39",
                        0
                    ],
                    "source": [
                        "obj-36",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-47",
                        1
                    ],
                    "order": 1,
                    "source": [
                        "obj-37",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-50",
                        0
                    ],
                    "order": 0,
                    "source": [
                        "obj-37",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-46",
                        0
                    ],
                    "source": [
                        "obj-39",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-36",
                        0
                    ],
                    "source": [
                        "obj-4",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-17",
                        0
                    ],
                    "source": [
                        "obj-40",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-47",
                        0
                    ],
                    "source": [
                        "obj-46",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-40",
                        1
                    ],
                    "order": 1,
                    "source": [
                        "obj-47",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-49",
                        1
                    ],
                    "order": 0,
                    "source": [
                        "obj-47",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-47",
                        0
                    ],
                    "source": [
                        "obj-50",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-23",
                        0
                    ],
                    "source": [
                        "obj-6",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-29",
                        0
                    ],
                    "source": [
                        "obj-7",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-11",
                        0
                    ],
                    "source": [
                        "obj-8",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-173",
                        0
                    ],
                    "source": [
                        "obj-17",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "destination": [
                        "obj-31",
                        0
                    ],
                    "source": [
                        "obj-15",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-31",
                        0
                    ],
                    "destination": [
                        "obj-gen-dscale-510",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-dscale-510",
                        0
                    ],
                    "destination": [
                        "obj-gen-dsafe-829",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-gen-plt-821",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-dsafe-829",
                        0
                    ],
                    "destination": [
                        "obj-gen-plt-821",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-gen-nge-775",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-dsafe-829",
                        0
                    ],
                    "destination": [
                        "obj-gen-nadd-796",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-gen-nlt-914",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nadd-796",
                        0
                    ],
                    "destination": [
                        "obj-gen-nlt-914",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nge-775",
                        0
                    ],
                    "destination": [
                        "obj-gen-nand-847",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nlt-914",
                        0
                    ],
                    "destination": [
                        "obj-gen-nand-847",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-gen-spdiv-355",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-dsafe-829",
                        0
                    ],
                    "destination": [
                        "obj-gen-spdiv-355",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spdiv-355",
                        0
                    ],
                    "destination": [
                        "obj-gen-spmul-103",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spcyc-291",
                        0
                    ],
                    "destination": [
                        "obj-gen-spmask-774",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-plt-821",
                        0
                    ],
                    "destination": [
                        "obj-gen-spmask-774",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-gen-snsub-885",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-snsub-885",
                        0
                    ],
                    "destination": [
                        "obj-gen-sndiv-275",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-dsafe-829",
                        0
                    ],
                    "destination": [
                        "obj-gen-sndiv-275",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-sndiv-275",
                        0
                    ],
                    "destination": [
                        "obj-gen-snmul-849",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-sncyc-211",
                        0
                    ],
                    "destination": [
                        "obj-gen-snmask-450",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nand-847",
                        0
                    ],
                    "destination": [
                        "obj-gen-snmask-450",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-wr-895",
                        0
                    ],
                    "destination": [
                        "obj-gen-wadd-871",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-wadd-871",
                        0
                    ],
                    "destination": [
                        "obj-gen-wsig-861",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-wsig-861",
                        0
                    ],
                    "destination": [
                        "obj-gen-selp-856",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-wsig-861",
                        0
                    ],
                    "destination": [
                        "obj-gen-seln-198",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-selp-856",
                        0
                    ],
                    "destination": [
                        "obj-gen-outsub-587",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-seln-198",
                        0
                    ],
                    "destination": [
                        "obj-gen-outsub-587",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-outsub-587",
                        0
                    ],
                    "destination": [
                        "obj-40",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spmul-103",
                        0
                    ],
                    "destination": [
                        "obj-gen-spadd-135",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spadd-135",
                        0
                    ],
                    "destination": [
                        "obj-gen-spcyc-291",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-snmul-849",
                        0
                    ],
                    "destination": [
                        "obj-gen-snadd-177",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-snadd-177",
                        0
                    ],
                    "destination": [
                        "obj-gen-sncyc-211",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spdiv-355",
                        0
                    ],
                    "destination": [
                        "damp-pos-add",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-pos-add",
                        0
                    ],
                    "destination": [
                        "damp-pos-cyc",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-pos-cyc",
                        0
                    ],
                    "destination": [
                        "damp-pos-mul",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-pos-mul",
                        0
                    ],
                    "destination": [
                        "damp-pos-add2",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-pos-add2",
                        0
                    ],
                    "destination": [
                        "damp-pos-mask",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-plt-821",
                        0
                    ],
                    "destination": [
                        "damp-pos-mask",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-sndiv-275",
                        0
                    ],
                    "destination": [
                        "damp-neg-add",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-neg-add",
                        0
                    ],
                    "destination": [
                        "damp-neg-cyc",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-neg-cyc",
                        0
                    ],
                    "destination": [
                        "damp-neg-mul",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-neg-mul",
                        0
                    ],
                    "destination": [
                        "damp-neg-add2",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-neg-add2",
                        0
                    ],
                    "destination": [
                        "damp-neg-mask",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nand-847",
                        0
                    ],
                    "destination": [
                        "damp-neg-mask",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-plt-821",
                        0
                    ],
                    "destination": [
                        "obj-gen-selp-856",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-spmask-774",
                        0
                    ],
                    "destination": [
                        "obj-gen-selp-856",
                        2
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-pos-mask",
                        0
                    ],
                    "destination": [
                        "obj-gen-selp-856",
                        3
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-nand-847",
                        0
                    ],
                    "destination": [
                        "obj-gen-seln-198",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-gen-snmask-450",
                        0
                    ],
                    "destination": [
                        "obj-gen-seln-198",
                        2
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "damp-neg-mask",
                        0
                    ],
                    "destination": [
                        "obj-gen-seln-198",
                        3
                    ]
                }
            }
        ]
    }
}