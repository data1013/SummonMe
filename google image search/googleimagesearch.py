import urllib2
import json
import cStringIO
from league_names import champ_list_maker, weird_names
from clarifai_basic import ClarifaiCustomModel, ApiError

concept = ClarifaiCustomModel('7aHTExCPi2drd-DX2dJjyQNu7elDvMXxvTo8KHgu', 'rTSOazFe9NFcpVkSn-_TDWc13wSsyBNKPlMh5dES')

fetcher = urllib2.build_opener()

champion_list = champ_list_maker()
weird_name_list = weird_names()
space_names = ["MasterYi", "TwistedFate", "Cho'Gath", "Kha'Zix", "Kog'Maw", "Rek'Sai"]

for champion in space_names:
	searchTerm = champion
	googleimages = []

	for sI in xrange(2):
		startIndex = 4*sI
		searchUrl = "http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + searchTerm + "+lol&start=" + str(startIndex)
		f = fetcher.open(searchUrl)
		deserialized_output = json.load(f)
		for i in xrange(min(len(deserialized_output['responseData']['results']), 10)):
			imageUrl = deserialized_output['responseData']['results'][i]['unescapedUrl']
			googleimages.append(imageUrl)		

	for images in googleimages:
		try:
			concept.positive(images, searchTerm)
		except ApiError:
			pass

	concept.train(searchTerm)
	print champion

"""
try:
	result = concept.predict('https://www.panerabread.com/panerabread/menu/details/smoked-ham-and-swiss-sandwich-whole.jpg/_jcr_content/renditions/smoked-ham-and-swiss-sandwich-whole.desktop.jpeg', searchTerm)
except ApiError:
	pass

print result
"""
