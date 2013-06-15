define([
    "scyllaApp",
    "toastr"
], function(
    scyllaApp,
    toastr
    ){

    return scyllaApp.controller("ReportController", function($scope, $http, Page) {
        Page.setFirstLevelNavId("reportsNav");
        Page.liviconItUp();
        $scope.$watch('reports', Page.liviconItUp );

        $scope.reports = [];
        $scope.reportToDelete = {};

        $scope.showDeleteReport = false;
        $scope.showNewReport = false;

        $scope.getThumbnail = function getThumbnail(report){
            if(report && report.masterResult) {
                return report.masterResult.thumb;
            }
            return "images/reportHasNoMasterResult.png"
        };

        $scope.getAllReports = function(){

            $http.get("/reports")
                .success(function(reports){
                             $scope.loaded = true;
                             $scope.reports = reports
                         })
                .error(function(err){
                           alert(err)
                       });
        };
        $scope.getAllReports();

        $scope.deleteReport = function deleteReport(report){
            $scope.showDeleteReport = true
            $scope.reportToDelete = report;
            console.log("Report to Delete", report);
        };

        $scope.deleteResult = function deleteResult(resultId){
            $http.delete("/report-results/" + resultId)
                .error(function(error){
                    console.error("Error Deleting Result", resultId, error);
                })
        }

        $scope.confirmDeleteReport = function confirmDeleteReport(report){
            console.log("Deleting Report", report);
            $http.get("/reports/" + report._id, {params:{includeResults:true}})
                .success(function(report){
                    if(report.results){
                        report.results.forEach(function(result){
                            $scope.deleteResult(result._id);
                        });
                    }
                    $http.delete("/reports/" + report._id)
                        .success(function(deletedReport){
                            console.log("Deleted Report",deletedReport);
                            $scope.getAllReports();
                            $scope.showDeleteReport = false;
                        })
                        .error(function(err){
                            console.error(err);
                        });
                });

        };

        $scope.addReport = function(name, url){
            console.log("New Report: ", name, url);
            $http.post("/reports", {name:name,url:url})
                .success(function(report){
                    $scope.showNewReport = false;
                    toastr.success("New Report Created: " + report.name);
                    $scope.getAllReports();
                 })
                .error(function(error){
                    console.error("Error Saving Report: ", error);
                    $("#newReport .alert").show();
                    //TODO: Show Specific Failure Message

                });
        };
    });
});
