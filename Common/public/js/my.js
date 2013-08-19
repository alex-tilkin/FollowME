$(document).ready(function()
{
	$('#getstudents').on('click', function(event)
	{
		$('#liststudents').load("users/getuser/alextilk@gmail.com");
		//$('#liststudents').load("students");
	});

	$('#getstudent').on('click', function(event)
	{
		var sid = $('#sid').val();
		console.log("sid=" + sid);
		$.get("student/" + sid, function(data)
			{
				console.log(".get data = " + data);
				$('#student').html(data);
			});
	});
});