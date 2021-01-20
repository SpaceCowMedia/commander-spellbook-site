// code copied directly from v1 site, styling TBD
// all modal formatting needs to be removed and reworked into static page

 <!-- Metrics Modal -->
  <div class="modal fade" id="metricsModal" tabindex="-1" role="dialog" aria-labelledby="metricsLabel"
    aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="metricsLabel">Combo Metrics</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <table class="table">
            <thead>
              <tr>
                <th width="38%">
                  <center>METRIC</center>
                </th>
                <th width="57%">
                  <center>IDENTITY</center>
                </th>
                <th width="5%">
                  <center>COUNT</center>
                </th>
              </tr>
            </thead>
            <tbody id="metrics"></tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>