const data = [

    {

        routerName: "read",
        PostRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",
                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            },
            {
                routing: "find",
                receiver: [
                    {
                        hebrewName: "שם האוסף",
                        name: "req.body.collection",
                        type: "string"
                    },
                    {
                        hebrewName: "אובייקט לצורך סינון",
                        name: "req.body.filter",
                        type: "object"
                    },
                    {
                        hebrewName: "שם עמודה",
                        name: "req.body.sort",
                        type: "string"
                    }
                ],
                description: "מקבלת שם אוסף, אובייקט לפי מה רוצה לסנן וכן שם עמודה לפיה רוצה למיין את המערך שחוזר. מחזיר מערך של אובייקטים מהמונגו",
                return: "arr",
                example: "",
                dataBase:"mongo-db"

            },
            {
                routing: "countRows",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "req.body.tableName",
                        type: "string"
                    },
                    {
                        hebrewName: "תנאי",
                        name: "req.body.condition",
                        type: "string"
                    }
                ],
                description: "מקבלת שם טבלה ותנאי. הפונקציה מבצעת שאלתה המחזירה את השורות בטבלה שעומדות בתנאי המבוקש ומחזירה את כמות השורות שחזרו מן השאילתה",
                return: "int",
                example: "",
                dataBase:"sql"

            },
            {
                routing: "readTopN",
                receiver: [
                    {
                        hebrewName: "מספר שורות",
                        name: "req.body.n",
                        type: "int"
                    },
                    {
                        hebrewName: "שם טבלה",
                        name: "req.body.tableName",
                        type: "string"
                    },
                    {
                        hebrewName: "שמות העמודות",
                        name: "req.body.columns",
                        type: "string"
                    },
                    {
                        hebrewName: "תנאי",
                        name: "req.body.condition",
                        type: "string"
                    }
                ],
                description: "מקבלת אובייקט עם הנתונים:שם טבלה, מחרוזת של כל העמודות שרוצים לראות, תנאי שלפיו יבואו הנתונים ומספר רשומות ראשונות שרוצים לקבל הבקשה מחזירה את מספר השורות הראשונות של הטבלה לפי התנאי והמספר המבוקש",
                return: "arr",
                example: "",
                dataBase:"sql"

            }
        ],
        GetRequests: [
            {
                routing: "countdocuments",
                receiver: [
                    {
                        hebrewName: "שם האוסף",
                        name: "collection",
                        type: "string"
                    }
                ],
                description: "מקבלת את שם האוסף ושולחת לפונקצייה מובנית במונגו הסופרת אתץ כמות האובייקטים באוסף המבוקש. מחזירה מספר - כמות האובייקטים באוסף.",
                return: "int",
                example: "",
                dataBase:"mongo-db"

            },
            {
                routing: "distinct",
                receiver: [
                    {
                        hebrewName: "שם האוסף",
                        name: "collection",
                        type: "string"
                    },
                    {
                        hebrewName: "שם עמודה",
                        name: "filter",
                        type: "string"
                    }
                ],
                description: "הבקשה מקבלת שני משתנים:שם האוסף ושם העמודה.היא שולחת אותם לפונקציה במודול ששולחת לפונקציה במונגו  הפונקציה פונה לאוסף המבוקש ומחזירה מערך  של הערכים של העמודה המבוקשת ללא כפילויות",
                return: "arr",
                example: "",
                dataBase:"mongo-db"

            },
            {
                routing: "readAll",
                receiver: [{
                    hebrewName: "שם טבלה",
                    name: "tbname",
                    type: "string"
                },
                {
                    hebrewName: "תנאי",
                    name: "condition",
                    type: "string"
                }

                ],
                description: "מקבלת שם של טבלה ותנאי ושולחת לפונקצייה המחזירה מהטבלה את השורות העומדות בתנאי הנתון. הבקשה מחזירה מערך של אובייקטים כך שכל אובייקט הוא שורה בטבלה",
                return: "arr",
                example: "",
                dataBase:"sql"

            },
            {
                routing: "readAll",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "tbname",
                        type: "string"
                    }
                ],
                description: "מקבלת שם של טבלה ושולחת לפונקצייה המחזירה את כל הטלה ללא תנאי. הבקשה מחזירה מערך של אובייקטים כך שכל אובייקט הוא שורה בטבלה",
                return: "arr",
                example: "",
                dataBase:"sql"

            },
            {
                routing: "connectTables",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "tablename",
                        type: "string"
                    },
                    {
                        hebrewName: "condition",
                        name: "תנאי",
                        type: "string"
                    }
                ],
                description: "מטרת הפונקצייה:להביא את הטבלה המבוקשת עם העמודות המלאות בערך שלהן ולא בקוד או מספר סידורי. הבקשה מקבלת שם טבלה ותנאי עליו יתבצע צירוף הטבלאות. הפונקצייה עוברת על כל העמודות בטבלה ובודקת אילו עמודות הן מסוג מפתח זר. כל עמודה שהיא מסוג מפתח זר הפונקצייה פונה אל הטבלה המשוייכת אליה ומביאה ממנה את הערך הכתוב מהעמודה שרשומה בתור ברירת מחדל לפי הקוד הנתון בהתאמה.לבסוף חוזר לי אובייקט של הטבלה המקורית כשבמקום קוד מופיע הערך של העמודות ",
                return: "arr",
                example: "",
                dataBase:"sql"
            },
            {
                routing: "foreignkeyvalue",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "tablename",
                        type: "string"
                    },
                    {
                        hebrewName: "שדה",
                        name: "field",
                        type: "string"
                    },
                    {
                        hebrewName: "מספר סידורי",
                        name: "id",
                        type: "string"
                    }
                ],
                description: "הבקשה מקבלת את שם הטבלה ממנה יש לשאוב את הנתונים , את שם העמודה בה מופיע הקוד שהוא (פורנקי) לטבלה מסוימת ואת מספר הקוד - שורה שעליה  מקבלים את הנתונים. הבקשת () שולחת את שם העמודה ושם הטבלה לפונקציה שמחזירה את שם הטבלה אליה הקוד מיוחס ואז מחפשת את העמודה שהיא (מפתח יחיד) ושולחת לפונקציית (קריאה מהבסיס נתונים) שמחזירה את האובייקט המבוקש",
                return: "object{id:number,fieldName:value}",
                example: "tableName:leads, columnName:clientCode, id:מטרת הקריאה לבקשה:לקבל את הלקוח פרטי הלקוח שמופיע בטבלת לידים לא על פי קוד אלא את הפרטים האמיתיים שבטבלת לקוחות. הבקשה מקבלת:שם טבלה(לידים) ,שם עמודה:(קוד-לקוח), קוד:(212) הפונקצייה בודקת בעמודת(קוד-לקוח) לאיזה טבלה היא משוייכת ומקבלת את שם הטבלה:(לקוחות) ואז מחפשת בטבלת (לקוחות) את העמודה שהיא מפתח יחיד ומקבלת את עמודת:(מספר סידורי) ובעמודה זו מחפשת את הקוד המבוקש ומחזירה אובייקט{קוד:212, שם:יעקב כהן}כגעגכע גכע"  ,
                dataBase:"sql"

            },
            {
                routing: "readjoin",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "tableName",
                        type: "string"
                    },
                    {
                        hebrewName: "שם עמודה" ,
                        name: "column",
                        type: "string"
                    }
                ],
                description: "מקבלת את שם הטבלה ואת שם העמודה לפיה מתבצע הצירוף. הפונקציה עוברת על כל העמודות בטבלה. על כל עמודה שהיא מסוג מפתח זר היא מבצעת צירוף לטבלה אליה העמודה משויכת עם הטבלה הבסיסית בהתאמה לשם העמודה שהתקבל. הפונקצייה עובדת בצורה רקורסיבית כך שכל טבלה אליה היא מגיעה במשך הסריקה היא עוברת על כל העמודות ועל כל העמודות של הטבלאות המשוייכות אליה וכו עד שמגיעה לטבלה שאין בה שום עמודה מסוג של מפתח זר. בסופו של עניין התשובה שחוזרת היא מערך של אובייקטים שכל אובייקט מכיל את הנתונים מכל הטבלאות המצורפות יחד.  ",
                return: "arr",
                example: "",
                dataBase:"sql"

            },
            {
                routing: "auto_complete",
                receiver: [
                    {
                        hebrewName: "שם טבלה",
                        name: "table",
                        type: "string"
                    },
                    {
                        hebrewName: "עמודה",
                        name: "column",
                        type: "string"
                    },
                    {
                        hebrewName: "מילה",
                        name: "word",
                        type: "string"
                    }
                ],
                description: "הלקוח נותן את פרטי הטבלה והעמודה ממנה הוא רוצה לקבל את הנתונים, כמו כן הוא רושם מחרוזת במטרה לקבל תשובה מהשרת : את כל המילים מהעמודה המסוימת שמתחילות במחרוזת הנתונה",
                return: "arr",
                example: "",
                dataBase:"sql"

            }
        ]



    },

    {

        routerName: "admin",
        PostRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ],
        GetRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ]



    },
    {

        routerName: "create",
        PostRequests: [
            {
                routing: "create",
                receiver: [
                    {
                        hebrewName: "שם הטבלה",
                        name: "req.body.tableName",
                        type: ""
                    },
                    {
                        hebrewName: "מערך אובייקטים של מה שצריך להוסיף שהמפתח הוא שם העמודה והערך הוא הערך של העמודה בהתאמה",
                        name: "req.body.values",
                        type: "arr"
                    },
                   
                ],
                description: "הפונקצייה מקבלת שם טבלה ומערך אובייקטים של מפתח וערך והיא מוסיפה רשומה לטבלה המבוקשת",
                return: "",
                example: "",
                dataBase:""

            },
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ],
        GetRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ]



    },
    {

        routerName: "login",
        PostRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ],
        GetRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ]



    },
    {

        routerName: "update",
        PostRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ],
        GetRequests: [
            {
                routing: "",
                receiver: [
                    {
                        hebrewName: "",

                        name: "",
                        type: ""
                    }
                ],
                description: "",
                return: "",
                example: "",
                dataBase:""

            }
        ]



    }

]


