require 'sinatra'
require 'gcloud/vision'
require 'securerandom'
require 'base64'

# send the simple static html file back
get '/' do
  send_file 'public/index.html'
end

# classify a picture with the Cloud Vision API
post '/sendpic' do
  content_type :json

  # grab the base64 encoded image from the request
  pic = params[:pic]
  pic.sub!("data:image/png;base64,", "")
  decoded_pic = Base64.decode64(pic)
  decoded_pic = StringIO.new(decoded_pic)

  # process the image with the Cloud Vision API
  gcloud = Gcloud.new "bringmehansolo", "./keys.json"
  v = gcloud.vision
  i = v.image decoded_pic
  a = v.annotate i, labels: 10
  labels = a.labels.map(&:description)
  puts "labels: #{labels}"

  # return the list of labels to the client
  labels.to_json
end
